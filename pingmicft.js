const urlServidor = 'https://mi.cftestataltarapaca.cl'; // Reemplaza con la URL de tu servidor
const grafico = document.getElementById('grafico');
const latenciaElement = document.getElementById('latencia');
const tablaRegistros = document.getElementById('tabla-registros').getElementsByTagName('tbody')[0];
const historialLatencia = [];
const MAX_HISTORIAL = 50; // Máximo para el gráfico
const INTERVALO_MUESTRA = 2000; //Intervalo de 2 segundos
const anchoBarra = 12; // Ancho de la barra ajustado
const UMBRAL_LATENCIA_ALTA = 300;
const UMBRAL_LATENCIA_MEDIA = 120;
const MAX_REGISTROS_TABLA = 8;

function simularPing() {
    const inicio = new Date().getTime();

    fetch(urlServidor, { method: 'GET', mode: 'no-cors' })
        .then(response => {
            const fin = new Date().getTime();
            const latencia = fin - inicio;
            latenciaElement.textContent = latencia;

            agregarLatenciaAlHistorial(latencia);
            actualizarGrafico();
            agregarRegistroATabla(new Date(), latencia);

            if (!response.ok) {
                console.warn(`Error en la solicitud: ${response.status}`);
            }
        })
        .catch(error => {
            console.error("Error al contactar el servidor:", error);
            latenciaElement.textContent = "Error";
            agregarLatenciaAlHistorial(null);
            actualizarGrafico();
            agregarRegistroATabla(new Date(), null);
        });
}

function agregarLatenciaAlHistorial(latencia) {
    historialLatencia.push(latencia);

    if (historialLatencia.length > MAX_HISTORIAL) {
        historialLatencia.shift();
    }
}

function actualizarGrafico() {
    grafico.innerHTML = '';

    const maxLatencia = Math.max(...historialLatencia.filter(l => l !== null), 0) || 100;

    for (let i = 0; i < historialLatencia.length; i++) {
        const latencia = historialLatencia[i];
        const barra = document.createElement('div');
        barra.classList.add('barra');

        let altura = 0;
        let color = '#4CAF50';

        if (latencia !== null) {
            altura = (latencia / maxLatencia) * 100;
            altura = Math.min(altura, 100);

            if (latencia > UMBRAL_LATENCIA_ALTA) {
                color = '#F44336';
            } else if (latencia > UMBRAL_LATENCIA_MEDIA) {
                color = '#FFC107';
            }
        } else {
            color = '#9E9E9E';
        }

        barra.style.height = `${altura}%`;
        barra.style.backgroundColor = color;
        barra.style.left = `${i * anchoBarra}px`;
        grafico.appendChild(barra);
    }

    //Aumenta el intervalo ya que ahora solo hay 50 datos
    //grafico.style.width = `${historialLatencia.length * anchoBarra}px`;
    //console.log(historialLatencia.length);
}

function agregarRegistroATabla(timestamp, latencia) {
    const fila = tablaRegistros.insertRow(0);
    const celdaTimestamp = fila.insertCell(0);
    const celdaLatencia = fila.insertCell(1);
    const celdaEstado = fila.insertCell(2);

    celdaTimestamp.textContent = timestamp.toLocaleTimeString();
    celdaTimestamp.title = timestamp.toLocaleString();

    let estado = 'OK';
    let claseLatencia = '';

    if (latencia === null) {
        celdaLatencia.textContent = 'Error';
        estado = 'Error';
    } else {
        celdaLatencia.textContent = latencia;

        if (latencia > UMBRAL_LATENCIA_ALTA) {
            claseLatencia = 'latencia-alta';
            estado = 'Alta';
        } else if (latencia > UMBRAL_LATENCIA_MEDIA) {
            claseLatencia = 'latencia-media';
            estado = 'Media';
        }
    }

    celdaEstado.textContent = estado;
    fila.classList.add(claseLatencia);

    while (tablaRegistros.rows.length > MAX_REGISTROS_TABLA) {
        tablaRegistros.deleteRow(MAX_REGISTROS_TABLA);
    }
}

// Inicia la simulación
setInterval(simularPing, INTERVALO_MUESTRA);