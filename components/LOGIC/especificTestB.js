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


//consulta Purchase
async function requestPurchase( purchase, myTest, myInteraction) {

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

async function allResultsRequest(test) {

    let results = {
        usability: {
            with: null,
            without: null /* without aplica para el test B (sin botones) y el test A (con botones, sin interacción*/
        },

        engagement: {
            with: null,
            without: null
        },
        
        addTocart:{
            with: null,
            without: null
        },


        purchase:{
            with: null,
            without: null, /* without aplica para el test B (sin botones) y el test A (con botones, sin interacción*/
        }

    }

    test == 'A' && (
        results.usability.with      = await requestUsability(test, '>'),
        results.usability.without   = await requestUsability(test, '='),

        results.engagement.with     = await requestEngagement(test, '>'),
        results.engagement.without  = await requestEngagement(test, '='),

        results.addTocart.with      = await requestAddToCar(test,'>','>'),
        results.addTocart.without   = await requestAddToCar(test,'=','>'),

        results.purchase.with       = await requestPurchase('>', test, '>'),
        results.purchase.without    = await requestPurchase('>', test, '=')

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

        structure.totalWith = structure.with;
        structure.totalWithout = structure.without;
    
        return (structure)
}


/** Función para construir la tabla de datos generales */
async function buildTable(test) {
    const results   = await allResultsRequest(test);
    const totalTime = plusTime(results.engagement);
    
    
    let 
    purchaseWith        = (results.purchase.with /results.usability.with *100).toFixed(2), 
    purchaseWithout     = (results.purchase.without /results.usability.without *100).toFixed(2),
    addtocartWith       = (results.addTocart.with /results.usability.with *100).toFixed(1),    
    addtocartWithout    = (results.addTocart.without /results.usability.without *100).toFixed(1)
    
   console.log("Con i "+results.addTocart.with);
   console.log("Sin i "+results.addTocart.without);
   console.log("Con usabi "+results.usability.with);
   console.log("Sin usabi "+results.usability.without);

    test == 'A' && (document.body.querySelector(`.usabilitySin`).innerHTML = `Sin interacción: <span class="valorKPI">${results.usability.without}</span>`);
    document.body.querySelector(`.usabilityCon`).innerHTML = `Con interacción: <span class="valorKPI">${results.usability.with}</span>`;
    document.body.querySelector(`.diferenceUsability`).innerHTML = `Diferencia : ${(results.usability.with/(results.usability.with + results.usability.without)*100).toFixed(0)} %`
    
    /** Imprimiendo la engagement Con y Sin interacción */
    test == 'A' && (document.body.querySelector(`.engagementSin`).innerHTML = `Sin interacción: <span class="valorKPI">${Math.floor(totalTime.without / 60)} min ${totalTime.without % 60} seg</span>`);
    document.body.querySelector(`.engagemenCon`).innerHTML = `Con interacción: <span class="valorKPI">${Math.floor(totalTime.with / 60)} min ${totalTime.with % 60} seg</span>`;
    test == 'A' && (document.body.querySelector(`.diferenceEngagement`).innerHTML = `Diferencia : ${parseInt((totalTime.with / totalTime.without) * 100).toFixed(0)}%`);

     
    /** Imprimiendo add to cart Con y Sin interacción */
    test == 'A' && (document.body.querySelector(`.addToCartSin`).innerHTML = `Sin interacción: <span class="valorKPI">${addtocartWithout}</span>`);
    document.body.querySelector(`.addToCartCon`).innerHTML = `Con interacción: <span class="valorKPI">${addtocartWith}</span>`;
    test == 'A' && (document.body.querySelector(`.diferenceAddToCart`).innerHTML = `Diferencia : ${((addtocartWith/addtocartWithout) *100).toFixed(0)} %`);



    test == 'A' && (document.body.querySelector(`.purchaseSin`).innerHTML =`Sin interacción <span class="valorKPI">${purchaseWithout}</span>`);
    document.body.querySelector(`.purchaseCon`).innerHTML = `Con interacción: <span class="valorKPI">${purchaseWith}</span>`;
    test == 'A' && (document.body.querySelector(`.diferencePurchase`).innerHTML = `Diferencia : ${((purchaseWith/purchaseWithout) *100).toFixed(0)} %`)



     /** Renderizar la gráfica de usabilidad */
     graphicUsability(results.usability);

    /** Renderizar la gráfica de Engagement */
    graphicEngagement(totalTime, test);

    /** Renderizar la gráfica de Purchase */
    graphicAddTocart(results.addTocart, results.usability);

       /** Renderizar la gráfica de Purchase */
     graphicPurchase(results.purchase, results.usability);

}


function graphicUsability(object, test) {
    document.body.querySelector('.graphicUsabilityRender').innerHTML = ``;
    let
        withI = object.with,
        withoutI = object.without

    const
        canvas = document.createElement('CANVAS');
    canvas.id = `chartUsability`;
    canvas.classList.add('graphicTableKpi');

    document.body.querySelector('.graphicUsabilityRender').appendChild(canvas);
    const ctx = document.body.querySelector(`#chartUsability`).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sin', 'Con'],
            datasets: [{
                label: 'Sin VS Con',
                data: [withoutI, withI], // El primer valor es el valor de la referencia
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


};

/** Función para renderizar la grafica de la card Engagement */
function graphicEngagement(object, test) {
    document.body.querySelector(`.graphicEngagementRender`).innerHTML = ``;

   

    // let 
    // totalWith    = Math.floor(object.without / 60) +":"+object.without % 60,
    // totalWithout =Math.floor(object.with / 60)+":"+object.with % 60
   

    const
    canvas = document.createElement('CANVAS');
    canvas.id = `chartEngagement`;
    canvas.classList.add('graphicTableKpi');

    document.body.querySelector('.graphicEngagementRender').appendChild(canvas);

    const ctx = document.body.querySelector(`#chartEngagement`).getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sin', `Con`],
            datasets: [{
                label: 'Sin VS Con',
                data: [object.without, object.with], // El primer valor es el valor de la referencia
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

};


/** Función para renderizar la gráfica de Conversión */
function graphicAddTocart(addtocart, usabilidad) {

    document.body.querySelector('.graphicAddToCarRender').innerHTML = ``;

    let
    withI = (addtocart.with /usabilidad.with*100).toFixed(2),
    withoutI = (addtocart.without /usabilidad.without*100).toFixed(2)


    const
        canvas = document.createElement('CANVAS');
    canvas.id = `chartAddToCar`;
    canvas.classList.add('graphicTableKpi');

    document.body.querySelector('.graphicAddToCarRender').appendChild(canvas);

    const ctx = document.body.querySelector(`#chartAddToCar`).getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sin', `Con`],
            datasets: [{
                label: 'Sin VS Con',
                data: [withoutI, withI], // El primer valor es el valor de la referencia
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
};



/** Función para renderizar la gráfica de Conversión */
function graphicPurchase(purchase, usabilidad) {

    document.body.querySelector('.graphicPurchaseRender').innerHTML = ``;

    let
    withI = (purchase.with /usabilidad.with*100).toFixed(2),
    withoutI = (purchase.without /usabilidad.without*100).toFixed(2)


    const
        canvas = document.createElement('CANVAS');
    canvas.id = `chartPurchase`;
    canvas.classList.add('graphicTableKpi');

    document.body.querySelector('.graphicPurchaseRender').appendChild(canvas);

    const ctx = document.body.querySelector(`#chartPurchase`).getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sin', `Con`],
            datasets: [{
                label: 'Sin VS Con',
                data: [withoutI, withI], // El primer valor es el valor de la referencia
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
};



await buildTable('A');
document.body.querySelector('.selectShopper').addEventListener('input', async () => {
    renderLoading()
    await buildTable('A');
})

document.body.querySelector('.selectDateInit').addEventListener('input', async () => {
    renderLoading()
   await buildTable('A');
})
document.body.querySelector('.selectDateEnd').addEventListener('input', async () => {
    renderLoading()
   await buildTable('A');
})