#!/usr/bin/env python3
"""
BITAYA Incluye — LLM Wiki scraper
Scrapes Costa Rica laws + institution sites → llm-wiki/raw/

Usage:
    python main.py                # run all scrapers
    python main.py --laws         # only SINALEVI laws
    python main.py --institutions # only institution sites
    python main.py --pdfs         # only PDFs
    python main.py --asamblea     # only Asamblea Legislativa
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sources.sinalevi import scrape_all_laws
from sources.institutions import scrape_all_institutions
from sources.asamblea import scrape_asamblea
from sources.pdfs import scrape_all_pdfs


def main() -> None:
    parser = argparse.ArgumentParser(description="BITAYA LLM Wiki scraper")
    parser.add_argument("--laws", action="store_true", help="Scrape SINALEVI laws")
    parser.add_argument("--institutions", action="store_true", help="Scrape institution sites")
    parser.add_argument("--pdfs", action="store_true", help="Download and extract PDFs")
    parser.add_argument("--asamblea", action="store_true", help="Scrape Asamblea Legislativa")
    args = parser.parse_args()

    run_all = not any([args.laws, args.institutions, args.pdfs, args.asamblea])

    if run_all or args.laws:
        print("\n=== SINALEVI Laws ===")
        scrape_all_laws()

    if run_all or args.pdfs:
        print("\n=== PDFs ===")
        scrape_all_pdfs()

    if run_all or args.institutions:
        print("\n=== Institution Sites ===")
        scrape_all_institutions()

    if run_all or args.asamblea:
        print("\n=== Asamblea Legislativa ===")
        scrape_asamblea()

    print("\nDone. Raw files at: llm-wiki/raw/")
    print("Next step: run LLM Wiki compile pass over raw/ to build wiki/")


if __name__ == "__main__":
    main()
