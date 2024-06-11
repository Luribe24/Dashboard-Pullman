// Función que muestra el mensaje "cargando" mientras se hacen las consultas ✔️
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

// Consulta usabilidad ✔️
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

// Consulta engagement ✔️
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

// Consulta Add to cart ✔️
async function requestAddToCar(myTest, myInteraction, myAddToCar) {
    let MyBody = {
        shopper: document.body.querySelector('.selectShopper').value,
        test: myTest,
        interaction: myInteraction,
        addToCar: myAddToCar,
        dateInit: document.body.querySelector('.selectDateInit').value,
        dateEnd: document.body.querySelector('.selectDateEnd').value,
    }


    const request = await fetch(`${urlConsult}addTocarRequestPixel`, {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(MyBody)
    })

    const response = await request.json();
    const data = await response[0].totalAddtocar;
    return data
};

// Consulta Purchase ✔️
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
            without: null, 
        },

        engagement: {
            with: null,
            without: null
        },
        
        addTocart: {
            with: null,
            without: null
        },
        
        purchase: {
            with: null,
            without: null, 
        }

        

       
    };

    test == 'A' && (
        results.usability.with      = await requestUsability(test, '>'),
        results.usability.without   = await requestUsability(test, '='),

        results.addTocart.with      = await requestAddToCar(test,'>','>'),
        results.addTocart.without   = await requestAddToCar(test,'=','>'),

        results.engagement.with     = await requestEngagement(test, '>'),
        results.engagement.without  = await requestEngagement(test, '='),

        results.purchase.with       = await requestPurchase('>', test, '>'),
        results.purchase.without    = await requestPurchase('>', test, '=')
    )

    test == 'B' && (

        results.usability.without   = await requestUsability(test, '='),
        results.engagement.without  = await requestEngagement(test, '='),
        results.addTocart.without   = await requestAddToCar(test,'=','>'),
        results.purchase.without    = await requestPurchase('>', test, '=')

    )

    return results
}

/** Conversión de segundos a minutos */
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

    const results           = await allResultsRequest(test);
    const totalTime         = plusTime(results.engagement);
    
    let
        totalAUsability     = results.usability.without,
        totalBUsability     = results.usability.with + results.usability.without,
        diferenceUsability  = (totalBUsability / (totalAUsability * 100) ).toFixed(0)

    let
    totalAPurchase          = results.purchase.without,
    totalBPurchase          = results.purchase.with + results.purchase.without,
    diferencePurchase       = (totalBPurchase / totalAPurchase * 100).toFixed(0)

    let
       totalAEngagement     = totalTime.with + totalTime.without

    let
        totalAddtocartA     = results.addTocart.without,
        totalAddtocartB     = results.addTocart.with + results.addTocart.without
    
      /** Imprimiendo sesiones Test A/B interacción */
    test == 'A' 
    ? (document.body.querySelector(`.usabilityA`).innerHTML = `Test B: <span class="valorKPI">${totalBUsability}</span>`)
    : document.body.querySelector(`.usabilityB`).innerHTML = `Test A: <span class="valorKPI">${totalAUsability}</span>`;
    test == 'A' && (document.body.querySelector(`.diferenceUsability`).innerHTML = `% Diferencia : ${diferenceUsability} %`)

    /** Imprimiendo engagement Test A/B interacción */
    test == 'A'
    ? (document.body.querySelector(`.engagementA`).innerHTML = `Test B: <span class="valorKPI">${Math.floor(totalAEngagement / 60)} min ${totalAEngagement % 60} seg</span>`)
    : document.body.querySelector(`.engagementB`).innerHTML = `Test A: <span class="valorKPI">${Math.floor(totalTime.without / 60)} min ${totalTime.without % 60} seg</span>`;

    test == 'A' && (document.body.querySelector(`.diferenceEngagement`).innerHTML = `% Diferencia : ${parseInt(( totalTime.without / totalAEngagement) * 100).toFixed(0)}%`);


    /** Imprimiendo Addtocart Test A/B interacción */
    test == 'A'
    ? (document.body.querySelector(`.addToCartA`).innerHTML = `Test B: <span class="valorKPI">${(totalAddtocartB / totalBUsability).toFixed(2)} </span>`)
    : document.body.querySelector(`.addToCartB`).innerHTML = `Test A: <span class="valorKPI">${(totalAddtocartA / totalAUsability).toFixed(2)} </span>`;

    test == 'A' && (document.body.querySelector(`.diferenceEngagement`).innerHTML = `% Diferencia : ${parseInt(( totalTime.without / totalAEngagement) * 100).toFixed(0)}%`);


    /** Imprimiendo purchase test A/B interacción */
    test == 'A' 
    ? (document.body.querySelector(`.purchaseA`).innerHTML = `Test B: <span class="valorKPI">${(totalBPurchase / totalBUsability * 100).toFixed(2)}</span>`)
    : document.body.querySelector(`.purchaseB`).innerHTML = `Test A: <span class="valorKPI">${(totalAPurchase / totalAUsability * 100).toFixed(2)}</span>`;

    test == 'A' && (document.body.querySelector(`.diferencePurchase`).innerHTML = `% Diferencia : ${diferencePurchase} %`)


    /* Se construye la gráfica de usabilidad */
     graphicUsability(results.usability, test);

    // /** Renderizar la gráfica de Engagement */
     graphicEngagement(totalTime, test);
    
    //  Renderizar grafica add to cart
    graphicAddtoCart(results.addTocart,results.usability, test)

    // /* Se construye la gráfica de usabilidad */
     graphicPurchase(results.purchase, results.usability, test);

}

function buildDiference (){

    setTimeout(()=>{
        // Usabilidad 
        const A = document.body.querySelector(`.usabilityA > span`).innerHTML
        const B = document.body.querySelector(`.usabilityB > span`).innerHTML

        document.body.querySelector(`.diferenceUsability`).innerHTML = 'Diferencia: ' + (( A/ B ) *100).toFixed()  + '%'; 

    },1000)

    setTimeout(()=>{
        // Usabilidad 
        const A = document.body.querySelector(`.addToCartA > span`).innerHTML
        const B = document.body.querySelector(`.addToCartB > span`).innerHTML

        document.body.querySelector(`.diferenceAddToCart`).innerHTML = 'Diferencia: ' + (( A/ B ) *100).toFixed()  + '%'; 

    },1000)


    setTimeout(()=>{
        // Conversión  
        const A = document.body.querySelector(`.purchaseA > span`).innerHTML
        const B = document.body.querySelector(`.purchaseB > span`).innerHTML


        document.body.querySelector(`.diferencePurchase`).innerHTML = 'Diferencia: ' + ((A/ B *100).toFixed())  + '%'; 

    },1000)

    setTimeout(()=>{

        // Tiempo de permanencia
        const A = document.body.querySelector(`.engagementA > span`).innerHTML.trim().replace(' min ','.').replace('seg','')
        const B = document.body.querySelector(`.engagementB > span`).innerHTML.trim().replace(' min ','.').replace('seg','')

        const ASeg = A.split('.');
        const BSeg = B.split('.');

        ASeg[0] = ASeg[0]*60
        BSeg[0] = BSeg[0]*60

        const AFinal = parseInt(ASeg[0])+ parseInt(ASeg[1]);
        const BFinal = parseInt(BSeg[0])+ parseInt(BSeg[1]);

        document.body.querySelector(`.diferenceEngagement`).innerHTML = 'Diferencia: ' + ( ( AFinal / BFinal ) *100 ).toFixed() + '%' ; 

    },1000)
   
    
}

/** Función para renderizar la grafica de la card usabilidad */
const structure = {
    testAUsability: null,
    testBUsability: null,
    testAPurchase:  null,
    testBPurchase:  null,
    testAEngagement:null,
    testBEngagement:null,
    testAAddTocart:null,
    testBAddTocart:null
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


function updateGraphAddtoCart() {
    // Verificar si ambos tests han sido cargados
    if (structure.testAAddTocart !== null && structure.testBAddTocart !== null) {
        document.body.querySelector('.graphicAddToCarRender').innerHTML = ``;

        const canvas = document.createElement('CANVAS');
        canvas.id = `chartAddToCar`;
        canvas.classList.add('graphicTableKpi');
        document.body.querySelector('.graphicAddToCarRender').appendChild(canvas);

        const ctx = document.body.querySelector(`#chartAddToCar`).getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Test A', 'Test B'],
                datasets: [{
                    label: 'Test A VS Test B',
                    data: [structure.testAAddTocart, structure.testBAddTocart],
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


function graphicAddtoCart(addtocart, usabilidad, test) {
    if (test === 'A') {
        structure.testBAddTocart = ((addtocart.with + addtocart.without) / (usabilidad.with + usabilidad.without) * 100).toFixed(2)
    } else if (test === 'B') {
        structure.testAAddTocart = (addtocart.without / usabilidad.without * 100).toFixed(2);
    }

    updateGraphAddtoCart();
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

buildDiference ()

document.body.querySelector('.selectShopper').addEventListener('input', async () => {
    renderLoading()
    await buildTable('A');
    await buildTable('B');
    
    buildDiference ()
})

document.body.querySelector('.selectDateInit').addEventListener('input', async () => {
    renderLoading()
    await buildTable('A');
    await buildTable('B');
    
    buildDiference ()
})
document.body.querySelector('.selectDateEnd').addEventListener('input', async () => {
    renderLoading()
    await buildTable('A');
    await buildTable('B');

    buildDiference ()
})

