
const seriesE = {
  E6:  [10, 15, 22, 33, 47, 68],
  E12: [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82],
  E24: [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91],
  E48: [100 * Math.pow(10, i / 48) for (let i = 0; i < 48)],
  E96: [100 * Math.pow(10, i / 96) for (let i = 0; i < 96)]
};

function expandSerie(serie) {
  const base = seriesE[serie] || [];
  let resultado = [];
  for (let dec = -12; dec <= 6; dec++) {
    resultado = resultado.concat(base.map(v => +(v * Math.pow(10, dec)).toPrecision(4)));
  }
  return resultado.filter(v => v > 0);
}

function calcularCombinaciones(valores, objetivo, tipo) {
  const combinaciones = [];
  const esParalelo = (a, b, c) => 1 / (1 / a + 1 / b + 1 / c);
  const esSerie = (a, b, c) => a + b + c;

  for (let i = 0; i < valores.length; i++) {
    for (let j = i; j < valores.length; j++) {
      for (let k = j; k < valores.length; k++) {
        const s = esSerie(valores[i], valores[j], valores[k]);
        const p = esParalelo(valores[i], valores[j], valores[k]);
        const errS = Math.abs(s - objetivo) / objetivo;
        const errP = Math.abs(p - objetivo) / objetivo;

        combinaciones.push({ tipo: "serie", valores: [valores[i], valores[j], valores[k]], total: s, error: errS });
        combinaciones.push({ tipo: "paralelo", valores: [valores[i], valores[j], valores[k]], total: p, error: errP });
      }
    }
  }

  combinaciones.sort((a, b) => a.error - b.error);
  return {
    serie: combinaciones.filter(c => c.tipo === "serie").slice(0, 2),
    paralelo: combinaciones.filter(c => c.tipo === "paralelo").slice(0, 2)
  };
}

function mostrar(combos, tipo, unidad) {
  const tabla = document.getElementById(tipo + "-table");
  tabla.innerHTML = "<tr><th>Valores</th><th>Total</th><th>Error (%)</th></tr>";
  combos.forEach(c => {
    tabla.innerHTML += `<tr>
      <td>${c.valores.map(v => v + ' ' + unidad).join(tipo === "serie" ? ' + ' : ' || ')}</td>
      <td>${c.total.toPrecision(4)} ${unidad}</td>
      <td>${(c.error * 100).toFixed(2)}%</td>
    </tr>`;
  });
}

function buscarCombinaciones() {
  const objetivo = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;
  const serie = document.getElementById("serie").value;

  if (isNaN(objetivo) || objetivo <= 0) {
    alert("Introduce un valor válido.");
    return;
  }

  const unidad = tipo === "res" ? "Ω" : "μF";
  const lista = expandSerie(serie).map(v => tipo === "res" ? v : v / 1e6);

  const { serie: serieCombos, paralelo: paraleloCombos } = calcularCombinaciones(lista, objetivo, tipo);

  mostrar(serieCombos, "serie", unidad);
  mostrar(paraleloCombos, "paralelo", unidad);
}
