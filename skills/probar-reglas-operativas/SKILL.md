---
name: probar-reglas-operativas
description: Diseñar y ejecutar pruebas de reglas operativas en automatizaciones de ecommerce, comparando entradas, resultados esperados y evidencia real. Usar al validar límites, datos incompletos o cambios de reglas antes de activar un flujo.
---

# Probar reglas operativas

Convierte una regla aprobada del negocio en casos comprobables. Entrega una matriz que distinga pruebas ejecutadas, fallidas y pendientes; preparar casos no demuestra que un bot funciona.

## Entradas

- Regla exacta, con unidades, moneda si corresponde y límites inclusivos o exclusivos.
- Flujo y versión que se quiere probar; entorno disponible y acciones autorizadas.
- Datos ficticios o anonimizados y respuesta esperada por el responsable del proceso.

Si falta la regla o hay contradicciones, registra la decisión pendiente. No conviertas el ejemplo de esta skill en política del negocio.

## Procedimiento

1. Escribe la salida esperada antes de ejecutar. Para cada límite incluye un valor inmediatamente inferior, el límite exacto y uno superior. Añade vacío, inválido y un caso habitual cuando sean relevantes.
2. Describe qué observar: respuesta, estado, registro creado o ausencia de una acción. Una frase correcta del bot no prueba que el registro cambió.
3. Ejecuta solo en el sistema y alcance autorizados. Esta skill no autoriza pedidos, mensajes a clientes, cobros ni cambios de producción. Usa una simulación cuando no exista entorno de prueba y nómbrala como tal.
4. Guarda salida obtenida, evidencia, versión y fecha. Marca `pasa` solo si la observación coincide con el resultado esperado. Si no se pudo ejecutar, usa `no_ejecutado`, nunca `pasa`.
5. Corrige la regla o implementación que falló y repite los casos afectados. Conserva el resultado previo para poder distinguir una corrección de una prueba que nunca se hizo.

## Salida

Una tabla o CSV con: `caso`, `regla`, `entrada`, `esperado`, `obtenido`, `resultado`, `evidencia`, `version`. Resume qué se verificó, qué sigue pendiente y qué impide activar el flujo. El porcentaje de casos que pasan describe únicamente esa muestra; no certifica todo el sistema.

## Ejemplo ejecutable

Ejemplo ficticio de clasificación interna, sin aprobaciones de compras: monto mayor o igual a 100000 → `revisar`; monto válido inferior → `normal`; vacío → `pedir_dato`; negativo, no numérico o no finito → `dato_invalido`. El número es ilustrativo y no una recomendación de presupuesto.

[Casos de ejemplo](assets/casos.csv) y [script de demostración](scripts/probar_ejemplo.py) usan Python 3, biblioteca estándar, sin red ni integraciones. Desde esta carpeta:

```sh
python3 scripts/probar_ejemplo.py
```

Debe producir seis casos `pasa`. Esto prueba la regla ficticia incluida, **no tu bot real**. Para probar tu flujo utiliza la misma matriz y recoge sus salidas reales por el canal autorizado.

Pedido de ejemplo al asistente: «Usa probar-reglas-operativas. Mi regla aprobada envía a revisión montos mayores o iguales a 100000. Prepara los seis casos de borde y datos inválidos. Ejecuta solo el ejemplo local; deja el sistema real como no ejecutado».

Puedes leer estas instrucciones y aplicarlas con tu asistente sin instalar nada. Para usarla como skill, copia la carpeta completa `probar-reglas-operativas` a la ubicación de skills compatible con tu asistente. La instalación no conecta servicios ni ejecuta pruebas automáticamente.
