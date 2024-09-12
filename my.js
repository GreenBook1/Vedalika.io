console.log(window.location.origin);
document.addEventListener("DOMContentLoaded", async function () {
  auth0
    .createAuth0Client({
      domain: "dev-j7x7ckm7eg86c7hw.us.auth0.com",
      clientId: "IsW715PKUhth8XHyrEvkvnvRntyRrgaQ",
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    })
    .then(async (auth0Client) => {
      logT= auth0Client;
      isAuthenticated = await auth0Client.isAuthenticated();
      userProfile = await auth0Client.getUser();
      if(isAuthenticated){changetodashboard();
        return;

      }
      // Assumes a button with id "login" in the DOM
      const loginButton = document.getElementById("strlearn");
      console.log("step1");
      loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        if (isAuthenticated) {
          changetodashboard();
        } else {
          auth0Client.loginWithRedirect();
        }
      });

      if (
        location.search.includes("state=") &&
        (location.search.includes("code=") ||
          location.search.includes("error="))
      ) {
        console.log("calling this");
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
      }
      console.log("step2");
      // Assumes a button with id "logout" in the DOM
      const logoutButton = document.getElementById("logout");

      logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        auth0Client.logout();
      });

      

      // Assumes an element with id "profile" in the DOM
    });
    
  enrolledtad = "";
  fetchcourse();
  
  
});

let selectedcourse = "index0";
const CONVEX_URL = "https://groovy-quail-416.convex.cloud";
const client = new convex.ConvexClient(CONVEX_URL);

function courseselect(i) {
  document.getElementById(selectedcourse).style.backgroundColor = "";
  selectedcourse = "index" + i;
  document.getElementById(selectedcourse).style.backgroundColor = "#333333";
  document.getElementById("output-section").innerHTML =
    `<h2>${tad[i].coursename}  by 👉 ${tad[i].author} <p style="text-align:right;">Beginner</p></h2>
  <div style="display:flex;align-item:center;justify-content:space-around;">
  <p style="padding:10px 50px;background-color:orange;border-radius:5px;">Enrolled - ${tad[i].studentsenrolled}</p>
  <p style="padding:10px 50px;background-color:green;border-radius:5px;">Students Completed - ${tad[i].studentscompleted}</p>
  <p style="padding:10px 50px;background-color:blue;border-radius:5px;">Score - ${tad[i].coursepoints}</p>
  </div>
  <p>
  <br>
  <strong>Course Details</strong><br>
  ${tad[i].courseDesc}
  </p>
  <br>
  <p>
  ${Object.entries(tad[i].chapters)
    .map(([key, value]) => `${key} - ${value}`)
    .join(` <br>`)}
  </p>
  course link /${tad[i].courseLink} <br>
  <button onclick="JoinCourse(${i})" style="display:flex; cursor:pointer; margin:auto; padding:10px 60px;background-color:#white; justify-content:space-around;color:black; border-radious:5px;font-size:20px;font-weight:bolder;font-style:italic; ">Join Course</button>
  `;
}

function demo() {
  alert("hi");
}
async function fetchcourse() {
  tad = await client.query("tasks:getCourses", {});
  const cour = document.getElementById("courses-list");
  let da = "";
  for (let i in tad) {
    da += `<li onclick="courseselect(${i})" id="${"index" + i}"><a>${tad[i].coursename}</a></li>`;
  }
  cour.innerHTML = da;
  const deflist = document.getElementById("index0");
  deflist.style.backgroundColor = "#333333";
  const defcont = document.getElementById("output-section");

  defcont.innerHTML = `<h2>${tad[0].coursename}  by 👉 ${tad[0].author} <p style="text-align:right;">Beginner</p></h2>
  <div style="display:flex;align-item:center;justify-content:space-around;">
  <p style="padding:10px 50px;background-color:orange;border-radius:5px;">Enrolled - ${tad[0].studentsenrolled}</p>
  <p style="padding:10px 50px;background-color:green;border-radius:5px;">Students Completed - ${tad[0].studentscompleted}</p>
  <p style="padding:10px 50px;background-color:blue;border-radius:5px;">Score - ${tad[0].coursepoints}</p>
  </div>
  <p>
  <br>
  <strong>Course Details</strong><br>
  ${tad[0].courseDesc}
  </p>
  <br>
  <p>
  ${Object.entries(tad[0].chapters)
    .map(([key, value]) => `${key} - ${value}`)
    .join(` <br>`)}
  </p>
  course link /${tad[0].courseLink} <br>
  <button onclick="JoinCourse(0)" style="display:flex; cursor:pointer; margin:auto; padding:10px 60px;background-color:#white; justify-content:space-around;color:black; border-radious:5px;font-size:20px;font-weight:bolder;font-style:italic; ">Join Course</button>
  `;
}

function changetodashboard() {
  const mainp = document.getElementById("main-id");
  mainp.innerHTML = ` 
    <div class="profilecont">
    <section><section><img src="${userProfile["picture"]}" height="50" width="50"></section><section>${userProfile["nickname"]}<br>${userProfile["sub"]}<br>${userProfile["name"]}</section></section>
    <section>
    <button onclick="logr()" class="dashLogout" >Logout</button>
    </section>
    </div>
    <div class="crsdata"><section class="one">
      <button onclick="change_cont(0)" id="bty1" style="background-color:green;" class="bty">Enrolled</button>
      <button onclick="change_cont(1)" id="bty2" class="bty">Recomended</button>
      <aside id="coursearea" class="coursearea" style="overflow:auto;">No Enrolled Courses</aside>
    </section><section id="output-section" class="two">Select Course to see Status here</section></div>
    <div id="contests" class="contests"></div>
    
    `;
    change_cont(0);
}

// dashboard select buttons

function logr(){
  logT.logout();
}

let defdash = "0";
async function change_cont(butn) {
  enrolledtad = await client.query("tasks:getenrolledcorse", {
    studentid: userProfile["sub"],
  });
  console.log(enrolledtad);
  if(enrolledtad.length==0){
    enrolledtad = await client.mutation("tasks:createuser", {
      studentid: userProfile["sub"],
    });
    change_cont(0);
  }
  if (butn == 0) {
    document.getElementById("bty2").style.backgroundColor = "whitesmoke";
    document.getElementById("bty1").style.backgroundColor = "green";
    if (tad != null && enrolledtad.length > 0) {
      if (enrolledtad[0]["enrolledcource"].length > 0) {
        let data = "";
        enrolledtad[0]["enrolledcource"].forEach(function tor(element, index) {
          data += `<p onclick="enrcselect(${index})" id="enrc${index}" class="slc">${element["coursename"]}</p>`;
        });
        document.getElementById("coursearea").innerHTML = data;
      }
    }
  } else {
    tad = await client.query("tasks:getCourses", {});
    let data = "";
    tad.forEach(function tor(element, index) {
      data += `<p onclick="courseselect(${index})" id="${"index" + index}"" class="slc">${element["coursename"]}</p>`;
    });
    document.getElementById("bty2").style.backgroundColor = "green";
    document.getElementById("bty1").style.backgroundColor = "whitesmoke";
    document.getElementById("coursearea").innerHTML = data;
  }
}
let defenrc = "enrc0";
function enrcselect(index) {
  document.getElementById(defenrc).style.backgroundColor = "";
  document.getElementById(`enrc${index}`).style.backgroundColor = "#222222";
  defenrc = `enrc${index}`;
  document.getElementById("output-section").innerHTML = `
  <h2>${enrolledtad[0]["enrolledcource"][index]["coursename"]}</h2>
  <p> You are enrolled in Course No ${enrolledtad[0]["enrolledcource"][index]["courseid"]}</p>
  <p> Current Progress is ${enrolledtad[0]["enrolledcource"][index]["progress"]} percent</p>
  <br>
  <button onclick="divertcourse('${enrolledtad[0]["enrolledcource"][index]["courseid"]}')" style="background-color:green; cursor:pointer;display:flex; color:white; border-color:transparent;margin:auto;padding:10px;">Continue Course</button>

  
  `;
}


function divertcourse(courseid){
  const data = { courseid: courseid, userid: userProfile["sub"]};
  sessionStorage.setItem('CourseuserInfo', JSON.stringify(data));
  window.location.href = "dynamic_Course.html";
}

async function JoinCourse(i) {
  console.log(isAuthenticated);
  if (isAuthenticated) {
    checkuser(i);
    // check if user already registered a course if not add new entry
    // check if it is registered for the same project if not then edit the entry
  } else {
    alert("please login to Proceed / or click start learning");
  }
}

async function checkuser(i) {
  console.log("reach here by");
  if (enrolledtad === "") {
    enrolledtad = await client.query("tasks:getenrolledcorse", {
      studentid: userProfile["sub"],
    });
  }
  console.log("reach here by 1");
  if (enrolledtad.length > 0) {
    console.log("user is already enrolled in a course already.");
    // check if is enrolled in same course
    console.log(tad[i]);
    console.log(enrolledtad[0].enrolledcource);
    let doesexist = false;
    enrolledtad[0].enrolledcource.forEach((element) => {
      console.log(element, element["courseid"]);

      if (tad[i]._id === element["courseid"]) {
        doesexist = true;
        // same course already registered
        console.log("yes");
        alert("The Cource is already Registed for you.");
      }
    });
    if (!doesexist) {
      //similar same course is not registered need to append the course
      console.log("try to add new entry");
      console.log(tad[i].noq);
      let objectr = {
        courseid: tad[i].courseLink.toString(),
        coursename: tad[i].coursename,
        progress: "0",
        solved: "0",
        remaning: tad[i].noq,
      };
      let newdata = enrolledtad[0].enrolledcource.concat(objectr);
      console.log("july");
      console.log(enrolledtad[0]._id);
      console.log(newdata);
      try {
        client.mutation("tasks:addcourceappend", {
          id: enrolledtad[0]._id,
          data: newdata,
        });
      } catch (e) {
        console.log(e);
        console.log("error");
      }
    }
  } else {
    console.log("user is not found");
    // crete a new user whole push
  }
}
