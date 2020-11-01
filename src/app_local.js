import Web3 from 'web3';
import "core-js/stable";
import "regenerator-runtime/runtime";
import Gymmarketplace from './abis/Gymmarketplace.json'
import Identicon from 'identicon.js';

// variables

const contract_add_kovan = '0x0005069DE1ef6021695Fc4249A84E3E003A315f2';

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'}) 

const productsDOM = document.querySelector(".products-center");
const image_bnDOM = document.querySelector(".benhan_center");
const address_nav = document.querySelector(".address")
const user_img = document.querySelector(".user_im");
const user_data = document.querySelector(".user_data");

const productid = document.querySelector(".productid");
// const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");

const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");

let array_buffer = 0;
let _account;

document.addEventListener("DOMContentLoaded",async () => {
    // console.log(ipfsx);
 
    const contracts = new contract();
    loaddrugData() ;
    const img_user = new load_and_show();
    img_user.load_img().then( (outp)=>{
    img_user.show_img_cer(outp);
    img_user.show_img_data(outp);
    })
    contracts.loadWeb3().
    then (contracts.loadaddress().
              then( addres =>{contracts.showaddress(addres);
    }));

    contracts.loadBlockchainData().then( (produtcount) =>{ contracts.displayProducts(produtcount);
      contracts.getBagButtons(produtcount);
      contracts.cartLogic(); 
    });
    contracts.loadimage().then( (ima_res)=>{
     contracts.dis_image_bnDOM(ima_res);
    })
  });


class contract {

  constructor(){ 
    this.donthuoc = [];
    this.image = [];
    this.acount_load ;
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }
  async loadaddress(){
    const web3 = window.web3
    // // Load account
    const accounts = await web3.eth.getAccounts();
    this.acount_load = accounts[0];
    _account = accounts[0];
    // console.log(typeof this.acount_load)
    return accounts[0];
  }
  async showaddress(address){
    let result = "";
      result += `
          <h5>${address}</h5>
   `;
    address_nav.innerHTML = result;
  }
  async loadimage(){
    const web3 = window.web3
    // // Load account
    const accounts = await web3.eth.getAccounts()
    // Network ID
    const networkId = await web3.eth.net.getId()
    // const networkData = Gymmarketplace.networks[networkId]
    // if(networkData) {
      const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi, contract_add_kovan)
      //-----------------------------------------------------------------------
      //load don thuoc
      const imageCout = await gymmarketplace.methods.imageCount().call()
      // console.log("image count",imageCout);
      // Load product
      for (var i = 1; i <= imageCout; i++) {
        const don = await gymmarketplace.methods.images(i).call()
        this.image.push(don);
      }
    // } else {
    //   window.alert('Contract not deployed to detected network.')
    // }
    return  this.image;
  }
  async loadBlockchainData() {
    const web3 = window.web3
    // // Load account
    const accounts = await web3.eth.getAccounts()
    // Network ID
    const networkId = await web3.eth.net.getId()
    // const networkData = Gymmarketplace.networks[networkId]
    // if(networkData) {
      const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi, contract_add_kovan)
      //-----------------------------------------------------------------------
      //load don thuoc
      const productCout = await gymmarketplace.methods.productCount().call()
      // console.log("produc", productCout);
      // Load product
      for (var i = 1; i <= productCout; i++) {
        const don = await gymmarketplace.methods.products(i).call()
        this.donthuoc.push(don);
      }
    // } else {
    //   window.alert('Contract not deployed to detected network.')
    // }
    return  this.donthuoc;
  }
  async displayProducts(produts) {
    console.log(produts);
    let result = "";
      produts.forEach( produt =>{
        if(produt.id_bn.length > 15){
          var data = new Identicon(`${produt.id_bn}`, 420).toString();}
        else{
            var data = new Identicon(`0x0005069DE1ef6021695Fc4249A84E3E003A315f2`, 420).toString();}
        var n =  produt.id_bn.localeCompare(this.acount_load);
            // console.log("n", n);
        if(n == 0){ 

          if(!produt.purchased){
            result += `
                    <div class="img-container">
                      <img 
                        src="data:image/png;base64,` + data + `"
                        alt="product"
                        class="product-img"
                        />
                      <button class="bag-btn" data-id =${produt.id}>
                        <i class="fas fa-shopping-cart"></i>
                        BUY
                      </button>
                      <h5>${produt.id_bn}</h5>
                    </div> `;
                }
              else{
                result += `
                <div class="img-container">
                  <img 
                    src="data:image/png;base64,` + data + `"
                    alt="product"
                    class="product-img"
                    />
                  <button>
                    PURCHASED
                  </button>
                  <h5>${produt.id_bn}</h5>
                </div>
                `;}    
          }          
      })
    productsDOM.innerHTML = result;
  } 
  async dis_image_bnDOM(image_bns){
    if(image_bns.length != 0){

      let result = "";
      // console.log(image_bns);
      image_bns.forEach( image_bn =>{
        if(image_bn.type_im == 1){
          var n =  image_bn.id_bn.localeCompare(this.acount_load);
          if(n == 0){

          // console.log(image_bn)
          result += `
                <div class="img-container">
                  <img 
                    src=http://ipfs.infura.io/ipfs/${image_bn.ahash}
                    alt="product"
                    class="product-img"
                    style={{maxWidth = '420px'}}
                    />
                    <h5>${image_bn.description}</h5>
                  <h5>${image_bn.id_bn}</h5>
                </div>

          `;}
        }
      })
      image_bnDOM.innerHTML = result;
    }
}

  //cart -----------------------------------------------------------------------
  getBagButtons(produts) {
    let chose;
    let id_but = 0;
    const buttons = [...document.querySelectorAll(".bag-btn")];
    // console.log("button", buttons)
    buttons.forEach( button => {
      button.addEventListener("click", event => {
        // disable button
        id_but = button.dataset.id;
        console.log(id_but);
        event.target.innerText = "In Bag";
        // event.target.disabled = true;
        console.log(id_but)
        chose = produts[id_but-1]; 
        console.log(chose)
        this.setCartValues(chose);
        this.addCartItem(chose);
        this.showCart()
      });
    })
;

   
  }
  setCartValues(cart) {
      if(cart.length != 0){
        productid.innerText = cart.id;
        console.log("chose",cart)
        let soluong = cart.soluong.split(",");
        let sum = soluong.reduce((a, b) => {
          return Number(a) + Number(b);
        }, 0);
        // console.log("sum", sum)
        let tempTotal = sum * 0.1;
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
      }
      else{
        cartTotal.innerText = 0;
      }


  }
  makeTableHTML(array_name, array_sl) {
    var result = "<table border=1> <thead><tr><th>STT</th><th>Tên Thuốc</th> <th>Số Lượng</th></tr></thead>";
    for(var i=0; i<array_name.length; i++) {
      result += "<tr>";
      result += "<td>"+(i+1)+"</td><td>"+array_name[i]+"</td><td>"+array_sl[i]+"</td>" ;
      result += "</tr>";
    }
    result += "</table>";

    return result;
  }
  addCartItem(item) {
   
    let tenthuoc = item.name.split(",");
    let soluong = item.soluong.split(",");
    let ten_thuoc = this.makeTableHTML(tenthuoc, soluong);
  
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<!-- cart item -->
           
            <!-- item info -->
            <div>
              ${ten_thuoc}
            </div>
            <!-- item functionality -->
            
          <!-- cart item -->
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {

      clearCartBtn.addEventListener("click", () => {
        this.clearCart();
      });
      cartContent.addEventListener("click", event => {
        if (event.target.classList.contains("remove-item")) {
          let removeItem = event.target;
          let id = removeItem.dataset.id;
          cart = cart.filter(item => item.id !== id);
          console.log(cart);

          this.setCartValues(cart);
          
          cartContent.removeChild(removeItem.parentElement.parentElement);
          const buttons = [...document.querySelectorAll(".bag-btn")];
          buttons.forEach(button => {
            if (parseInt(button.dataset.id) === id) {
              button.disabled = false;
              button.innerHTML = `<i class="fas fa-shopping-cart"></i>BUY`;
            }
          });
        } else if (event.target.classList.contains("fa-chevron-up")) {
          let addAmount = event.target;
          let id = addAmount.dataset.id;
          let tempItem = cart.find(item => item.id === id);
          tempItem.amount = tempItem.amount + 1;

          this.setCartValues(cart);
          addAmount.nextElementSibling.innerText = tempItem.amount;
        } else if (event.target.classList.contains("fa-chevron-down")) {
          let lowerAmount = event.target;
          let id = lowerAmount.dataset.id;
          let tempItem = cart.find(item => item.id === id);
          tempItem.amount = tempItem.amount - 1;
          if (tempItem.amount > 0) {

            this.setCartValues(cart);
            lowerAmount.previousElementSibling.innerText = tempItem.amount;
          } else {
            cart = cart.filter(item => item.id !== id);
  
            this.setCartValues(cart);

            cartContent.removeChild(lowerAmount.parentElement.parentElement);
            const buttons = [...document.querySelectorAll(".bag-btn")];
            buttons.forEach(button => {
              if (parseInt(button.dataset.id) === id) {
                button.disabled = false;
                button.innerHTML = `<i class="fas fa-shopping-cart"></i>BUY`;
              }
            });
          }
        }
    });
    // }
  }
  clearCart() {

     let cart = [];
     this.setCartValues(cart);

    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach(button => {
      button.disabled = false;
      button.innerHTML = `<i class="fas fa-shopping-cart"></i>BUY`;
    });
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  //end cart--------------------------------------------------------------------
}


  

async function buyProduct(id_product, price){
  const web3 = window.web3
  let hexString = web3.utils.toWei (price, 'Ether');
  const accounts = await web3.eth.getAccounts();

    const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi,contract_add_kovan);
    gymmarketplace.methods.purchaseProduct(id_product, 1).send({ from: accounts[0], value: hexString })
    .once('receipt', (receipt) => {
      console.log(receipt);
    })
  
}
class upload_ipfss{
  constructor(hash, im_des, im_idbn) {
    this.hash = hash;
    this.im_des = im_des;
    this.im_idbn = im_idbn;
  }
  async  upload_ipfs(){
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts();
 

    // const networkId = await web3.eth.net.getId();
    // const networkData = Gymmarketplace.networks[networkId];
    // if(networkData) {
      const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi, contract_add_kovan);
      gymmarketplace.methods.uploadImage(this.hash, this.im_des,this.im_idbn, 3 ).send({ from: accounts[0]  })
      .once('receipt', (receipt) => {
        console.log(receipt);
      })
    // }
  }


}


let file ;
let array_buffer_converted_to_buffer;
let drug_infor = [];
let img_cer = [];
$(".butt_ifps").click( async ()=>{
  
  if(array_buffer == 1){
    array_buffer = 0;
    await ipfs.add(array_buffer_converted_to_buffer, (err, res)=>{
      if(err){
     console.log("err", err);
     return
     }
     console.log(res[0].hash)
     let xhash = res[0].hash;
     var im_des = document.getElementById('benh_an').value.toString();
     var im_idbn = document.getElementById('benhan_add_bn').value.toString();
     console.log( im_des, im_idbn);
     const upi = new upload_ipfss(xhash, im_des, im_idbn);
     upi.upload_ipfs();
    });
  }
});

$("input[type=file]").change(  (e) =>{
  array_buffer = 1;
  file =  e.target.files[0];
  const reader = new window.FileReader();
  reader.readAsArrayBuffer(file);
  reader.onloadend =  (() => {
    array_buffer_converted_to_buffer = Buffer(reader.result); 
    // console.log(array_buffer_converted_to_buffer)
  })
});


$(".produc_purchase").click( ()=>{
  var value_eth = cartTotal.innerText;
  var id_pro = productid.innerText;
  buyProduct(id_pro,value_eth);
})

$(".drug_track").click( ()=>{
  let iddivice_go = document.getElementById('selectNumber');
  let id_divice_querry = iddivice_go.options[iddivice_go.selectedIndex].value;
  show_map_drug(drug_infor, id_divice_querry);

});

class load_and_show{
  
  async load_img(){
   
    let img_count;
    const web3 = window.web3
    // Network ID
    const networkId = await web3.eth.net.getId()
    // const networkData = Gymmarketplace.networks[networkId]
    // if(networkData) {
      const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi, contract_add_kovan)
      //-----------------------------------------------------------------------
      img_count = await gymmarketplace.methods.imageCount().call()
      // console.log("image count",img_count);
      // Load product
      for (var i = 1; i <= img_count; i++) {
        const iimg = await gymmarketplace.methods.images(i).call()
        img_cer.push(iimg);
      }
    // } else {
    //   window.alert('Contract not deployed to detected network.')
    // }
    // console.log(img_cer);
    return img_cer;
  
  }
    
  show_img_cer(input_datas){
      let result = "";
      input_datas.forEach( input_data =>{
       if(input_data.type_im == 2){

        _account
          result += `
                <div class="img-container">
                  <img 
                    src=http://ipfs.infura.io/ipfs/${input_data.ahash}
                    alt="product"
                    class="product-img"
              
                    />
                    <h5>${input_data.description}</h5>
                  <h5>${input_data.id_bn}</h5>
                </div>
  
          `;}
        
      })
        user_img.innerHTML = result;
      
  }
  show_img_data(input_datas){
    let result = "";
    input_datas.forEach( input_data =>{
     if(input_data.type_im == 3){
      var n =  input_data.author.localeCompare(_account);
      if(n ==0){
        result += `
              <div class="img-container">
                <img 
                  src=http://ipfs.infura.io/ipfs/${input_data.ahash}
                  alt="product"
                  class="product-img"
            
                  />
                  <h5>${input_data.description}</h5>
                <h5>${input_data.id_bn}</h5>
              </div>

        `;}
      }
    })
    user_data.innerHTML = result;
    
}
  
  }

  async function loaddrugData() {

    let drug_Cout;
    
    const web3 = window.web3
    // // Load account
    const accounts = await web3.eth.getAccounts()
    // Network ID
    const networkId = await web3.eth.net.getId()
    // const networkData = Gymmarketplace.networks[networkId]
    // if(networkData) {
      const gymmarketplace = new web3.eth.Contract(Gymmarketplace.abi,contract_add_kovan)
      //-----------------------------------------------------------------------
      //load don thuoc
      drug_Cout = await gymmarketplace.methods.drug_count().call()
      // console.log(drug_Cout);
      // Load product
      for (var i = 1; i <= drug_Cout; i++) {
        const don = await gymmarketplace.methods.drug_tracks(i).call()
        drug_infor.push(don);
      }
  
    // } else {
    //   window.alert('Contract not deployed to detected network.')
    // }
    // console.log(img_cer);
    show_menu_drug(drug_Cout, drug_infor);
   
    
  };
  function show_menu_drug(length_arr, arr){
    
    var select = document.getElementById("selectNumber");
  
    for(var i = 0; i < length_arr; i++) {
        var opt =  arr[i].name;
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
  }
  
  function show_map_drug(input, name_drug){
      input.forEach( (don_thuoc_1)=> {
        let drug_name = don_thuoc_1.name;
        if( drug_name === name_drug){
          $(".leaflet-marker-icon").remove();
          $(".leaflet-popup").remove();
          //clear marker
          let marker;
          let drug_lat = don_thuoc_1.lat.split(";");
          drug_lat.pop();
          let drug_lon = don_thuoc_1.lon.split(";");
          drug_lon.pop();
          let drug_id =  don_thuoc_1.owner;
          // console.log("lat", drug_lat, "lon", drug_lon);
          for (let j = 0; j < drug_lat.length; j++) {       
            let num_lat =  Number(drug_lat[j]);
            let num_lon = Number(drug_lon[j]);
            if( !isNaN(num_lon) || !isNaN(num_lat)){ 
              marker = new L.marker([num_lat,num_lon] )
              // .bindPopup('Id Divice: ' + data[j].id_device +'<a href="divice-chart.html"> View Chart</a>"').openPopup()
              .bindPopup(new L.popup().setContent(()=>{ let h5 = `<h5>${drug_name}</h5> <br>
                                                                  <h5>Nguoi cập nhật</h5>
                                                                  <h5>${drug_id}</h5> `
                                                        return h5;
                                                        }))
              // .openPopup()
              .on('click', ()=>{console.log("click")})
              .addTo(mymap);
            }
         }
        }
      
      
    });
    
  }

  const mymap = L.map('Map_divice').setView([10.7822576,106.6503497], 12);
    // mymap.invalidateSize()
    const attribution = '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
    const title_url = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    const title = L.tileLayer(title_url, {attribution} );
    title.addTo(mymap);
    $("#resizemap").click( ()=>{
      mymap.invalidateSize();
    })