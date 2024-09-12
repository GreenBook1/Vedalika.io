// Function to parse the .txt file content
const CONVEX_URL = "https://groovy-quail-416.convex.cloud";
const client = new convex.ConvexClient(CONVEX_URL);

let solvedr = 7;
let remaningr = 5;
let progressr = 3;
let enrolledtad;

document.addEventListener("DOMContentLoaded", async function () {
  userInfo = JSON.parse(sessionStorage.getItem("CourseuserInfo"));
  console.log(userInfo.userid);
  enrolledtad = await client.query("tasks:getenrolledcorse", {
    studentid: userInfo.userid,
  });
  console.log(enrolledtad[0].enrolledcource);
  for (let index = 0; index < enrolledtad[0].enrolledcource.length; index++) {
    let element = enrolledtad[0].enrolledcource[index];
    console.log(element.courseid, userInfo.courseid);

    if (element.courseid == userInfo.courseid) {
      console.log("reach here");
      updateme = index;
      solvedr = element.solved;
      remaningr = element.remaning;
      progressr = element.progress;

      break; // Exit the loop when the condition is met
    }
  }
  my();
});
// get user info that is id
// get courses enrolled and match with current course id
// fetch progress and other data
// ready to update on question solved button press
// check for if progress is 100 and show completion alert and redirect

function parseCourseFile(fileContent) {
  const lines = fileContent.split("\n");
  let html = "";
  let insideTextBlock = false;
  let insideCodeBlock = false;
  let textBlock = "";
  let codeBlock = "";
  let codeLang = "";
  let quesno = 1;

  lines.forEach(function (line, index) {
    // Course Title
    if (line.startsWith("Question:")) {
      const startIndex = line.indexOf("{"); // Find the index of '{a}'

      if (startIndex !== -1) {
        let ram = "7";
        let before = line.substring(0, startIndex); // Extract the part before '{a}'
        let after = line
          .substring(startIndex + 1, startIndex + 2)
          .toString()
          .trim(); // Extract 'a' from '{a}'

        console.log("Before {a}: ", before.trim()); // Output the part before '{a}'
        console.log("After {a}: ", after); // Output the 'a'
        if (quesno < solvedr+1) {
          html += `<div id="q${quesno}" style="display:none;><p> Question ${quesno}: ${before.replace("Question:", "").trim()}</p><input
    id="inp${quesno}" class="quizinput" type="text"><button class="quizb" onclick="checkans('${after}',${quesno})">submit</button></div>
    <div style="color:white; display:;" id="sol${quesno}">Question ${quesno} Solved ✔️</div>`;
        }
        else if(quesno == solvedr+1){
            html += `<div id="q${quesno}"><p> Question ${quesno}: ${before.replace('Question:', '').trim()}</p><input
            id="inp${quesno}" class="quizinput" type="text"><button class="quizb" onclick="checkans('${after}',${quesno})">submit</button></div>
            <div style="color:white; display:none;" id="sol${quesno}">Question ${quesno} Solved ✔️</div>`;
        }
        else{
            html += `<div id="q${quesno}" style="display:none;"><p> Question ${quesno}: ${before.replace('Question:', '').trim()}</p><input
            id="inp${quesno}" class="quizinput" type="text"><button class="quizb" onclick="checkans('${after}',${quesno})">submit</button></div>
            <div style="color:white; display:none;" id="sol${quesno}">Question ${quesno} Solved ✔️</div>`;
        }
      }
      quesno++;
    }

    if (line.startsWith("# Course Title:")) {
      html += `<h1>${line.replace("# Course Title:", "").trim()}</h1>`;
    }
    // Chapter Title
    else if (line.startsWith("## Chapter")) {
      html += `<h2>${line.replace("##", "").trim()}</h2>`;
    }
    // Subheading
    else if (line.startsWith("### Subheading")) {
      html += `<h3>${line.replace("### Subheading:", "").trim()}</h3>`;
    }
    // Text Block Start
    else if (line.startsWith("~~")) {
      if (insideTextBlock) {
        html += `<p>${textBlock.trim().replace(/\n/g, "<br>")}</p>`;
        textBlock = "";
      }
      insideTextBlock = !insideTextBlock;
    }
    // Code Block Start
    
    // Collecting Text Content
    else if (insideTextBlock) {
      textBlock += `${line}\n`;
    }
    // Image
    else if (line.startsWith("Image:")) {
      const imageUrl = line.replace("Image:", "").trim();
      html += `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto;" />`;
    }
    // Video
    else if (line.startsWith("Video:")) {
      const videoUrl = line.replace("Video:", "").trim();
      console.log(videoUrl);
      html += videoUrl;
    }
    // Math Equation
    else if (line.startsWith("Math:")) {
      const mathEquation = line.replace("Math:", "").trim();
      html += `<p>Math Equation: <span class="math-equation">${mathEquation}</span></p>`;
    }
  });
  updatechart();

  // Final check for any remaining open blocks
  if (insideTextBlock) {
    html += `<p>${textBlock.trim().replace(/\n/g, "<br>")}</p>`;
  }
  if (insideCodeBlock) {
    html += `<pre><code class="language-${codeLang}">${codeBlock.trim()}</code></pre>`;
  }

  return html;
}

async function my() {

const  MYID= enrolledtad[0].enrolledcource[updateme].courseid;
console.log(MYID);
  const ram = await client.query("tasks:getfile", {name:userInfo.courseid});
  console.log(ram);
  fetch(ram)
    .then((response) => response.text())
    .then((fileContent) => {
      const htmlContent = parseCourseFile(fileContent);
      document.getElementById("courseContainer").innerHTML = htmlContent;

      // Render math equations using MathJax
      MathJax.typesetPromise();
    });
}
// Example of fetching and parsing the content of the course file dynamically
function checkans(a, b) {
  let na = document.getElementById(`inp${b}`).value;
  console.log(document.getElementById(`inp${b}`).value);
  console.log(`correct answer is ${a.toString()}`);
  if (na === a) {
    console.log("answer is writ");
    solvedr++;
    remaningr--;
    progressr = (solvedr * 100) / (remaningr + solvedr);
    let newdata = enrolledtad[0].enrolledcource;
    newdata[updateme].progress = progressr;
    newdata[updateme].solved = solvedr;
    newdata[updateme].remaning = remaningr;

    myChart.destroy();
    updatechart();

    try {
      client.mutation("tasks:addcourceappend", {
        id: enrolledtad[0]._id,
        data: newdata,
      });
    } catch (e) {
      console.log(e);
    }
    document.getElementById(`q${b}`).style.display = "none";
    
    document.getElementById(`sol${b}`).style.display = "";
    try{document.getElementById(`q${b + 1}`).style.display = "";}catch(e){}
  } else {
    alert("wrong Answer");
  }
}

function updatechart() {
  document.getElementById("trackcontainer").innerHTML = `<p>Solved - ${solvedr}</p>
                <p>Remaining - ${remaningr}</p>
                <p>Progress - ${progressr} Percent</p>`;
  const ctx = document.getElementById("myChart").getContext("2d");
  myChart = new Chart(ctx, {
    type: "bar", // You can change this to 'line', 'pie', etc.
    data: {
      labels: ["Remaning Questions", "Solved Questions", "Overall Progress"],
      datasets: [
        {
          label: "Questions",
          data: [
            parseInt(remaningr),
            parseInt(solvedr),
            parseInt(progressr) / 100,
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
