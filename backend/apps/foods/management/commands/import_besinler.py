"""Besinleri (Diyetkolik scraper SQLite çıktısı) Postgres'e aktarır.

Sadece 6 alan aktarılır: name, serving_description, calories, protein, carbs, fat.
Tekrar çalıştırılabilir (UPSERT mantığı external_id üzerinden).

Kullanım:
    python manage.py import_besinler /path/to/besinler.db
    python manage.py import_besinler /path/to/besinler.db --dry-run
    python manage.py import_besinler /path/to/besinler.db --kalori-zorunlu
"""

from __future__ import annotations

import re
import sqlite3
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.foods.models import Food


# Sayfa başlığının sonundaki " Kaç Kalori?" suffix'ini temizler.
ISIM_TEMIZLE_REGEX = re.compile(r"\s*Kaç\s*Kalori\??\s*$", re.IGNORECASE)


def temizle_isim(ham: Optional[str]) -> str:
    if not ham:
        return ""
    temiz = ISIM_TEMIZLE_REGEX.sub("", ham).strip()
    return temiz or ham.strip()


def url_to_slug(url: Optional[str]) -> Optional[str]:

    if not url:
        return None
    try:
        path = urlparse(url).path.strip("/")
    except Exception:
        return None
    parcalar = [p for p in path.split("/") if p]
    return parcalar[-1] if parcalar else None


class Command(BaseCommand):
    help = "Diyetkolik scraper SQLite veritabanını Food modeline aktarır (UPSERT)."

    def add_arguments(self, parser):
        parser.add_argument(
            "sqlite_path",
            type=str,
            help="Scraper'ın oluşturduğu besinler.db dosyasının yolu.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Sadece sayım yap, gerçekten kayıt etme.",
        )
        parser.add_argument(
            "--kalori-zorunlu",
            action="store_true",
            help="Sadece kalori değeri olan kayıtları aktar (None olanları atla).",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=500,
            help="Transaction başına işlenecek kayıt sayısı (varsayılan: 500).",
        )

    def handle(self, *args, **options):
        sqlite_path = Path(options["sqlite_path"]).expanduser().resolve()
        if not sqlite_path.exists():
            raise CommandError(f"SQLite dosyası bulunamadı: {sqlite_path}")

        dry_run = options["dry_run"]
        kalori_zorunlu = options["kalori_zorunlu"]
        batch_size = options["batch_size"]

        self.stdout.write(f"Kaynak  : {sqlite_path}")
        self.stdout.write(f"Mod     : {'DRY-RUN' if dry_run else 'GERÇEK YAZMA'}")
        self.stdout.write(
            f"Filtre  : {'kalori zorunlu' if kalori_zorunlu else 'tüm kayıtlar'}"
        )
        self.stdout.write("")

        baglanti = sqlite3.connect(str(sqlite_path))
        baglanti.row_factory = sqlite3.Row

        sorgu = "SELECT isim, birim, kalori, karbonhidrat, protein, yag, url FROM besinler"
        if kalori_zorunlu:
            sorgu += " WHERE kalori IS NOT NULL"

        try:
            cur = baglanti.execute(sorgu)
            satirlar = cur.fetchall()
        finally:
            baglanti.close()

        toplam = len(satirlar)
        if toplam == 0:
            self.stdout.write(self.style.WARNING("Aktarılacak kayıt yok."))
            return

        self.stdout.write(f"Aktarılacak {toplam} kayıt bulundu.\n")

        olusturulan = 0
        guncellenen = 0
        atlanan = 0
        hata = 0

        def aktar_grup(grup):
            nonlocal olusturulan, guncellenen, atlanan, hata
            for row in grup:
                isim = temizle_isim(row["isim"])
                if not isim:
                    atlanan += 1
                    continue

                ham_url = (row["url"] or "").strip()
                slug = url_to_slug(ham_url)
                if slug:
                    external_id = slug
                else:
                    external_id = isim.lower().replace(" ", "-")

                degerler = {
                    "name": isim,
                    "serving_description": row["birim"] or "1 Porsiyon",
                    "calories": float(row["kalori"] or 0),
                    "protein": float(row["protein"] or 0),
                    "carbs": float(row["karbonhidrat"] or 0),
                    "fat": float(row["yag"] or 0),
                }

                try:
                    if dry_run:
                        # Sadece sayım
                        if Food.objects.filter(external_id=external_id).exists():
                            guncellenen += 1
                        else:
                            olusturulan += 1
                    else:
                        _, created = Food.objects.update_or_create(
                            external_id=external_id,
                            defaults=degerler,
                        )
                        if created:
                            olusturulan += 1
                        else:
                            guncellenen += 1
                except Exception as e:
                    hata += 1
                    self.stderr.write(
                        self.style.ERROR(f"  HATA: {isim} -> {e}")
                    )

        ilerleme = 0
        for i in range(0, toplam, batch_size):
            grup = satirlar[i : i + batch_size]
            if dry_run:
                aktar_grup(grup)
            else:
                with transaction.atomic():
                    aktar_grup(grup)
            ilerleme += len(grup)
            self.stdout.write(
                f"  İlerleme: {ilerleme}/{toplam} "
                f"(yeni: {olusturulan}, güncellendi: {guncellenen}, "
                f"atlandı: {atlanan}, hata: {hata})"
            )

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(self.style.SUCCESS("AKTARMA TAMAMLANDI"))
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(f"Toplam okundu  : {toplam}")
        self.stdout.write(f"Yeni eklenen   : {olusturulan}")
        self.stdout.write(f"Güncellenen    : {guncellenen}")
        self.stdout.write(f"Atlanan        : {atlanan}")
        self.stdout.write(f"Hata           : {hata}")
        if dry_run:
            self.stdout.write("")
            self.stdout.write(self.style.WARNING(
                "DRY-RUN: hiçbir değişiklik yapılmadı. "
                "Gerçek aktarma için --dry-run argümanını kaldır."
            ))
