let 
btnGenetal      = document.body.querySelector ('.iconGeneral'),
btntestb        = document.body.querySelector('.btnTestB'),
iframeContent   = document.body.querySelector('.conteintPrincipalIframe')

btnGenetal.addEventListener('click',()=>{
    document.body.querySelector('.retailerContainerMenu').style.opacity=0;
    iframeContent.src="./components/HTML/general.html";
    btnGenetal.classList.add('iconSelect');
    btntestb.classList.remove('iconSelect');   
});

btntestb.addEventListener('click',()=>{
    document.body.querySelector('.retailerContainerMenu').style.opacity=1;
    document.body.querySelector('.logoRetailMenu').src="";
    document.body.querySelector('.logoRetailMenu').innerHTML="";
    iframeContent.src="./components/HTML/especifictestB.html";
    btnGenetal.classList.remove('iconSelect'); 
});
