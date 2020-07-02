
mapboxgl.accessToken = 'pk.eyJ1IjoieWlzaGVuZzIwMDIiLCJhIjoiY2thdzV4cmVxMG1vNzJybzVlMHVhdTR6MSJ9.INKTMrf7oM0zXZ_U7gT79Q';
/*var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 4 // starting zoom
});*/

var mymap = L.map('mapid').setView([51.505, -0.09], 4);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: mapboxgl.accessToken
}).addTo(mymap);

const btn = document.getElementById("menu-btn");
const countryContainer = document.querySelector(".country-container");
const container = document.getElementById("container");
const title = document.querySelector(".title");
const infoContainer = document.querySelector(".info-container");
const Input = document.getElementById("country-input");
var mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken });
const inputButton = document.getElementById("button");

let menuShow = 0;
var requestOptions = {
    method: 'GET',
    redirect: 'follow'
};

btn.addEventListener("click",()=>{
    if(menuShow){
        container.style.width = "0vw";
        container.style.height = "0vh";
        title.style.visibility = "hidden";
        infoContainer.style.visibility = "hidden";
        menuShow--
    }else{
        container.style.width = "20vw";
        container.style.height = "100vh";
        title.style.visibility = "visible";
        infoContainer.style.visibility = "visible";
        menuShow++
    }
});




class Data  {

    constructor(countrydata){
        this.countryData = countrydata
    }


    displayList(){
        this.countryData.forEach((country,index) => {
            var listHtml = `
            <div class="country-list" id="${index+1}" >
                <div class="country-box">
                    <div class="country-name">
                        <img src="https://www.countryflags.io/${country.CountryCode}/flat/32.png">
                        <h3>${country.Country}</h3>
                    </div>
                    <div class="country-info">
                        <div class="country-confirm">TotalConfirmed : ${country.TotalConfirmed},</div> 
                        <div class="country-death">TotalDeaths : ${country.TotalDeaths},</div> 
                        <div class="country-recover">TotalRecovered : ${country.TotalRecovered}</div> 
                    </div>
                </div>
                <div class="country-num">${index+1}</div>
            </div>
            `
            countryContainer.innerHTML += listHtml;
        })
    };

    displayMarker(){ 
        this.countryData.forEach((country) =>{
            mapboxClient.geocoding
                .forwardGeocode({
                    query: country.Country,
                    autocomplete: false,
                    limit: 1
                })
                .send()
                .then(function(response) {
                    if (
                        response &&
                        response.body &&
                        response.body.features &&
                        response.body.features.length
                    ) {
                        var feature = response.body.features[0];

                        var radiusRange;
                        if(country.TotalConfirmed >= 1500000){
                            radiusRange=country.TotalConfirmed
                        }else if(country.TotalConfirmed >= 1000000 && country.TotalConfirmed < 1500000){
                            radiusRange=country.TotalConfirmed/1.5
                        } else if(country.TotalConfirmed >= 700000 && country.TotalConfirmed < 1000000){
                            radiusRange = country.TotalConfirmed/1.2
                        } else if(country.TotalConfirmed >= 300000 && country.TotalConfirmed < 700000){
                            radiusRange = country.TotalConfirmed*1
                        } else if(country.TotalConfirmed >= 100000 && country.TotalConfirmed < 300000){
                            radiusRange = country.TotalConfirmed*1.2
                        } else if(country.TotalConfirmed >= 50000 && country.TotalConfirmed < 100000){
                            radiusRange = country.TotalConfirmed*7
                        } else if(country.TotalConfirmed >= 10000 && country.TotalConfirmed < 50000){
                            radiusRange = country.TotalConfirmed*12
                        } else if(country.TotalConfirmed >= 5000 && country.TotalConfirmed < 10000){
                            radiusRange = country.TotalConfirmed*20
                        }else { 
                            radiusRange = country.TotalConfirmed*35
                        }
                        
                        var circle = L.circle([feature.center[1],feature.center[0]], {
                            color: 'red',
                            fillColor: '#f03',
                            fillOpacity: 0.5,
                            radius: radiusRange
                        }).addTo(mymap);

                    }
                });
        })
        
            
    };

    searchList(){
        inputButton.addEventListener("click",() =>{
            if(Input.value){
                this.countryData.forEach(element => {
                    if (element.Slug==Input.value){

                        mapboxClient.geocoding
                        .forwardGeocode({
                            query: element.Country,
                            autocomplete: false,
                            limit: 1
                        }
                        )
                        .send()
                        .then(function(response) {
                            if (
                                response &&
                                response.body &&
                                response.body.features &&
                                response.body.features.length
                            ) {
                                var feature = response.body.features[0];
        
                                return feature.center
                            }
                        })
                        .then(feature=>{
                            console.log(feature);
                            
                            var popup = L.popup()
                                .setLatLng([feature[1],feature[0]])
                                .setContent(
                                    '<div><img src="https://www.countryflags.io/'+element.CountryCode+'/flat/24.png">'+
                                    '<h4>'+element.Country+'</h4></div>'+
                                    '<p>Total Confirmed : '+element.TotalConfirmed+
                                    '<br/>Total Deaths : '+element.TotalDeaths+
                                    '<br/>Toatal Recovered : '+element.TotalRecovered+
                                    '<p>New Confirmed : '+element.NewConfirmed+
                                    '<br/>New Deaths : '+element.NewDeaths+
                                    '<br/>New Recovered : '+element.NewRecovered+
                                    '</p>'
                                )
                                .openOn(mymap);
                            
                        })
                    }
                })
            }
        })
    }
    

    showInfoWindow(){
        for (let i = 1;i<187;i++){
            document.getElementById(i).addEventListener("click",() =>{
                
                mapboxClient.geocoding
                .forwardGeocode({
                    query: this.countryData[i-1].Country,
                    autocomplete: false,
                    limit: 1
                },this.countryData[i-1]
                )
                .send()
                .then(function(response) {
                    if (
                        response &&
                        response.body &&
                        response.body.features &&
                        response.body.features.length
                    ) {
                        var feature = response.body.features[0];

                        return feature.center
                    }
                })
                .then(feature=>{
                    var popup = L.popup()
                        .setLatLng([feature[1],feature[0]])
                        .setContent(
                            '<div><img src="https://www.countryflags.io/'+this.countryData[i-1].CountryCode+'/flat/24.png">'+
                            '<h4>'+this.countryData[i-1].Country+'</h4></div>'+
                            '<p>Total Confirmed : '+this.countryData[i-1].TotalConfirmed+
                            '<br/>Total Deaths : '+this.countryData[i-1].TotalDeaths+
                            '<br/>Toatal Recovered : '+this.countryData[i-1].TotalRecovered+
                            '<p>New Confirmed : '+this.countryData[i-1].NewConfirmed+
                            '<br/>New Deaths : '+this.countryData[i-1].NewDeaths+
                            '<br/>New Recovered : '+this.countryData[i-1].NewRecovered+
                            '</p>'
                        )
                        .openOn(mymap);
                    
                })
            

                
            }),false
        }
    }
    

}






window.onload = fetch("https://api.covid19api.com/summary", requestOptions)
                    .then(response => response.json())
                    .then(result => {
                        let data = new Data(result.Countries);
                        data.displayList();
                        data.displayMarker();
                        data.showInfoWindow();
                        data.searchList();
                    })
                    

  


      