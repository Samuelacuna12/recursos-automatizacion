"""Prueba una regla FICTICIA local; no consulta ni certifica un bot real."""
import csv
from decimal import Decimal, InvalidOperation
from pathlib import Path
import sys


def clasificar(raw):
    value = raw.strip()
    if not value:
        return "pedir_dato"
    try:
        amount = Decimal(value)
    except InvalidOperation:
        return "dato_invalido"
    if not amount.is_finite() or amount < 0:
        return "dato_invalido"
    return "revisar" if amount >= Decimal("100000") else "normal"


def main():
    source = Path(__file__).resolve().parents[1] / "assets" / "casos.csv"
    with source.open(encoding="utf-8", newline="") as handle:
        cases = list(csv.DictReader(handle))
    if not cases:
        raise ValueError("El ejemplo no contiene casos; no se puede afirmar que pasa.")
    writer = csv.writer(sys.stdout, lineterminator="\n")
    writer.writerow(["caso", "entrada", "esperado", "obtenido", "resultado", "evidencia", "version"])
    failures = 0
    for case in cases:
        observed = clasificar(case["monto"])
        passed = observed == case["esperado"]
        failures += not passed
        writer.writerow([case["caso"], case["monto"], case["esperado"], observed,
                         "pasa" if passed else "falla", "funcion local ficticia clasificar", "ejemplo-1"])
    print("Solo demostración local. Sistema real: no_ejecutado.", file=sys.stderr)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
