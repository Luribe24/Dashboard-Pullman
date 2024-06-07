// Función que muestra el mensaje "cargando" mientras se hacen las consultas
function renderLoading() {

    let kpiContainer = document.body.querySelectorAll('.containerKPIS')
    for (let i = 0; i < kpiContainer.length; i++) {
        let kpiChildren = kpiContainer[i].children

        for (let i = 0; i < kpiChildren.length; i++) {
            let kpis = kpiChildren[i]
            kpis.innerHTML = 'Cargando...'
        }
    }
}

// Conexión con el back
let
    filtersValue = {},
    arrayToGraphic = [],
    arrayToTable = [],
    // urlConsult = `https://viewer.mudi.com.co:3589/api/mudiv1/`
    urlConsult = `http://localhost:3589/api/mudiv1/`

// Consulta usabilidad
async function requestUsability(myTest, myInteraction) {

    let MyBody = {
        shopper: document.body.querySelector('.selectShopper').value,
        test: myTest,
        interaction: myInteraction,
        dateInit: document.body.querySelector('.selectDateInit').value,
        dateEnd: document.body.querySelector('.selectDateEnd').value,
    }

    const request = await fetch(`${urlConsult}usabilityRequestPixel`, {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(MyBody)
    })

    const response = await request.json();
    const data = await response[0].sessions;

    return data

};

// Consulta engagement
async function requestEngagement(myTest, myInteraction) {

    let MyBody = {
        shopper: document.body.querySelector('.selectShopper').value,
        test: myTest,
        interaction: myInteraction,
        dateInit: document.body.querySelector('.selectDateInit').value,
        dateEnd: document.body.querySelector('.selectDateEnd').value,
    }

    const request = await fetch(`${urlConsult}engagementRequestPixel`, {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(MyBody)
    })

    const response = await request.json();
    const data = await response[0].time;
    return data
};

//consulta Purchase
async function requestPurchase(purchase, myTest, myInteraction) {

    let MyBody = {
        shopper: document.body.querySelector('.selectShopper').value,
        test: myTest,
        purchase: purchase,
        interaction: myInteraction,
        dateInit: document.body.querySelector('.selectDateInit').value,
        dateEnd: document.body.querySelector('.selectDateEnd').value,
    }

    const request = await fetch(`${urlConsult}purchaseRequestPixel`, {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(MyBody)
    })

    const response = await request.json();
    const data = await response[0].purchaseTotal;
    return data
};




// Función para obtener los valores de las consultas
async function allResultsRequest(test) {
    let results = {
        usability: {
            with: null,
            without: null, /* without aplica para el test B (sin botones) y el test A (con botones, sin interacción*/
        },

        purchase: {
            with: null,
            without: null, /* without aplica para el test B (sin botones) y el test A (con botones, sin interacción*/
        },
        engagement: {
            with: null,
            without: null
        }
    };

    test == 'A' && (
        results.usability.with = await requestUsability(test, '>'),
        results.usability.without = await requestUsability(test, '='),

        results.engagement.with = await requestEngagement(test, '>'),
        results.engagement.without = await requestEngagement(test, '='),

        results.purchase.with = await requestPurchase('>', test, '>'),
        results.purchase.without = await requestPurchase('>', test, '=')

    )

    test == 'B' && (
        results.usability.without = await requestUsability(test, '='),
        results.engagement.without = await requestEngagement(test, '='),
        results.purchase.without = await requestPurchase('>', test, '=')


    )
    return results
}

function plusTime(object) {

    let structure = {
        with: null,
        without: null
    }
        structure.with = object.with == null ? [0, 0, 0] : object.with.split(':'),
        structure.without = object.without == null ? [0, 0, 0] : object.without.split(':')

        structure.with[1] = structure.with == 0 ? 0 : parseInt(structure.with[1]) * 60
        structure.with = parseInt(structure.with[0]) + parseInt(structure.with[1]) + parseInt(structure.with[2])

        structure.without[1] = structure.without == 0 ? 0 : parseInt(structure.without[1]) * 60
        structure.without = parseInt(structure.without[0]) + parseInt(structure.without[1]) + parseInt(structure.without[2])

        // structure.totalA = structure.with + structure.without;
        // structure.totalB = structure.without;
    
        return (structure)
}



/** Función para construir la tabla de datos generales */
async function buildTable(test) {

    const results = await allResultsRequest(test);
    const totalTime = plusTime(results.engagement);
    
    let
        totalAUsability = results.usability.without,
        totalBUsability = results.usability.with + results.usability.without,
        diferenceUsability = (totalBUsability / totalAUsability * 100).toFixed(0)
       console.log(diferenceUsability);
    let
       totalAEngagement = totalTime.with + totalTime.without    


    let
        totalAPurchase = results.purchase.without,
        totalBPurchase = results.purchase.with + results.purchase.without,
        diferencePurchase = (totalBPurchase / totalAPurchase * 100).toFixed(0)

    test == 'A' && (document.body.querySelector(`.usabilityA`).innerHTML = `Test B: <span class="valorKPI">${totalBUsability}</span>`);
    document.body.querySelector(`.usabilityB`).innerHTML = `Test A: <span class="valorKPI">${totalAUsability}</span>`;
    test == 'A' && (document.body.querySelector(`.diferenceUsability`).innerHTML = `% Diferencia : ${diferenceUsability} %`)
    
     /** Imprimiendo la engagement Con y Sin interacción */
     test == 'A' && (document.body.querySelector(`.engagementA`).innerHTML = `Test B: <span class="valorKPI">${Math.floor(totalAEngagement / 60)} min ${totalAEngagement % 60} seg</span>`);
     document.body.querySelector(`.engagementB`).innerHTML = `Test A: <span class="valorKPI">${Math.floor(totalTime.without / 60)} min ${totalTime.without % 60} seg</span>`;
     test == 'A' && (document.body.querySelector(`.diferenceEngagement`).innerHTML = `% Diferencia : ${parseInt(( totalTime.without / totalAEngagement) * 100).toFixed(0)}%`);
   console.log(totalAUsability);
    test == 'A' && (document.body.querySelector(`.purchaseA`).innerHTML = `Test B: <span class="valorKPI">${(totalBPurchase / totalBUsability * 100).toFixed(2)}</span>`);
    document.body.querySelector(`.purchaseB`).innerHTML = `Test A: <span class="valorKPI">${(totalAPurchase / totalAUsability * 100).toFixed(2)}</span>`;
    test == 'A' && (document.body.querySelector(`.diferencePurchase`).innerHTML = `% Diferencia : ${diferencePurchase} %`)



    /* Se construye la gráfica de usabilidad */
    graphicUsability(results.usability, test);

    /** Renderizar la gráfica de Engagement */
    graphicEngagement(totalTime, test);

    /* Se construye la gráfica de usabilidad */
    graphicPurchase(results.purchase, results.usability, test);

}


/** Función para renderizar la grafica de la card usabilidad */
const structure = {
    testAUsability: null,
    testBUsability: null,
    testAPurchase:  null,
    testBPurchase:  null,
    testAEngagement:null,
    testBEngagement:null
};

function updateGraphUsability() {
    // Verificar si ambos tests han sido cargados
    if (structure.testAUsability !== null && structure.testBUsability !== null) {
        document.body.querySelector('.graphicUsabilityRender').innerHTML = ``;

        const canvas = document.createElement('CANVAS');
        canvas.id = `chartUsability`;
        canvas.classList.add('graphicTableKpi');
        document.body.querySelector('.graphicUsabilityRender').appendChild(canvas);

        const ctx = document.body.querySelector(`#chartUsability`).getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Test A', 'Test B'],
                datasets: [{
                    label: 'Test A VS Test B',
                    data: [structure.testAUsability, structure.testBUsability],
                    borderWidth: 1,
                    backgroundColor: ['#ff0700', '#0e2c59'],
                    barThickness: 40,
                    borderWidth: 3,
                    borderRadius: 10
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                        position: 'top'
                    }
                }
            }
        });
    }
}


function graphicUsability(object, test) {
    if (test === 'A') {
        structure.testBUsability = (object.without + object.with)
    } else if (test === 'B') {
        structure.testAUsability = object.without;
    }

    updateGraphUsability();
}


function updateGraphEngagement() {
    // Verificar si ambos tests han sido cargados
    if (structure.testAEngagement !== null && structure.testBEngagement !== null) {
        document.body.querySelector('.graphicEngagementRender').innerHTML = ``;

        const canvas = document.createElement('CANVAS');
        canvas.id = `chartEngagement`;
        canvas.classList.add('graphicTableKpi');
        document.body.querySelector('.graphicEngagementRender').appendChild(canvas);

        const ctx = document.body.querySelector(`#chartEngagement`).getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Test A', 'Test B'],
                datasets: [{
                    label: 'Test A VS Test B',
                    data: [structure.testAEngagement, structure.testBEngagement],
                    borderWidth: 1,
                    backgroundColor: ['#ff0700', '#0e2c59'],
                    barThickness: 40,
                    borderWidth: 3,
                    borderRadius: 10
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                        position: 'top'
                    }
                }
            }
        });
    }
}


function graphicEngagement(object, test) {
    if (test === 'A') {
        structure.testBEngagement = (object.without + object.with)
    } else if (test === 'B') {
        structure.testAEngagement = object.without;
    }

    updateGraphEngagement();
}




// Gráfica Purchase
function updateGraphPurchase() {
    // Verificar si ambos tests han sido cargados
    if (structure.testAPurchase !== null && structure.testBPurchase !== null) {
        document.body.querySelector('.graphicPurchaseRender').innerHTML = ``;

        const canvas = document.createElement('CANVAS');
        canvas.id = `chartPurchase`;
        canvas.classList.add('graphicTableKpi');
        document.body.querySelector('.graphicPurchaseRender').appendChild(canvas);

        const ctx = document.body.querySelector(`#chartPurchase`).getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Test A', 'Test B'],
                datasets: [{
                    label: 'Test A VS Test B',
                    data: [structure.testAPurchase, structure.testBPurchase],
                    borderWidth: 1,
                    backgroundColor: ['#ff0700', '#0e2c59'],
                    barThickness: 40,
                    borderWidth: 3,
                    borderRadius: 10
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                        position: 'top'
                    }
                }
            }
        });
    }
}

function graphicPurchase(purchase, usabilidad, test) {
    if (test === 'A') {
        structure.testBPurchase = ((purchase.with + purchase.without) / (usabilidad.with + usabilidad.without) * 100).toFixed(2)
    } else if (test === 'B') {
        structure.testAPurchase = (purchase.without / usabilidad.without * 100).toFixed(2);
    }

    updateGraphPurchase();
}



await buildTable('A');
await buildTable('B');

document.body.querySelector('.selectShopper').addEventListener('input', async () => {
    renderLoading()
    await buildTable('A');
    await buildTable('B');
})

document.body.querySelector('.selectDateInit').addEventListener('input', async () => {
    renderLoading()
    await buildTable('A');
    await buildTable('B');
})
document.body.querySelector('.selectDateEnd').addEventListener('input', async () => {
    renderLoading()
    await buildTable('A');
    await buildTable('B');
})

