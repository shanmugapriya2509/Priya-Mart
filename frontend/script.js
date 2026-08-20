fetch("https://localhost:8080/products")
.then(resourse => response.json())
.then(products =>{
    console.log(products);
})
.catch(error=>{
    console.log("Error:",error);
})
const text1 = document.querySelector("h2");
const text2 = document.querySelector(".splash-screen h1");
const text3 = document.querySelector(".splash-screen p");

const splashScreen = document.querySelector(".splash-screen");
const loginPage = document.querySelector(".login-page");

const value1 = "WELCOME TO OUR";
const value2 = "PRIYAMART";
const value3 = "YOUR SMART MINI SUPER MARKET";

if (sessionStorage.getItem("splashShown") === "true") {

    splashScreen.style.display = "none";
    loginPage.style.display = "flex";

} else {


text1.textContent = "";
text2.textContent = "";
text3.textContent = "";

function typeText(element, text, speed, next) {
    let i = 0;
    function type() {
       if (i < text.length) {
            element.textContent += text[i];
            i++;
            setTimeout(type, speed);
        } else {
            setTimeout(function () {
                if (next) {
                    next();
                }

            }, 500);
        }
    }

    type();
}
typeText(text1, value1, 100, function () {
    typeText(text2, value2, 120, function () {
        typeText(text3, value3, 80, function () {
            setTimeout(function () {
                sessionStorage.setItem("splashShown","true");
                splashScreen.style.display = "none";
                loginPage.style.display = "flex";

            }, 1000);

        });

    });

});
}
/*function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (username === "" || password === "") {
        alert("Please enter username and password");
    } else {

        alert("Login Successful!");
   }
}*/

setTimeout(function()
{
    document.querySelector(".splash-screen").style.display="none";
    document.querySelector(".login-page").style.display="flex";
},7500);

function login(){
    let username=document.getElementById("username").value;
    let password=document.getElementById("password").value;

    let usernameError=document.getElementById("usernameError");
    let passwordError=document.getElementById("passwordError");
    usernameError.textContent="";
    passwordError.textContent="";

    if(username===""){
        usernameError.textContent=" Please Enter your name or email";
    document.getElementById("username").style.border="1px solid red";
    }
       if(password==="")
       {
        passwordError.textContent=" Please Enter your password";
     document.getElementById("password").style.border="1px solid red";
       }
       if(username===""||password==="")       {
        return;
       }
       alert("Logic successfull");

}