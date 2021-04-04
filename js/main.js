const fetch_options = {
    headers: {
        'Content-Type': 'application/json'
    },
}

user = JSON.parse(localStorage.getItem('user')) || null
newUser = null

window.addEventListener('load', function () {

    const reg_form = document.getElementById('register')
    const login_form = document.getElementById('login')

    if (reg_form) {

        $('#register').on('submit', function (event) {

            event.preventDefault();
            event.stopPropagation();

            let newUser = {
                id: Math.floor(Math.random() * 10000),
                username: document.querySelector('#register #firstname').value + Math.floor(Math.random() * 10000),
                password: 'usr' + Math.floor(Math.random() * 100000),
                firstname: document.querySelector('#register #firstname').value,
                lastname: document.querySelector('#register #lastname').value,
                address: document.querySelector('#register #address').value,
                email: document.querySelector('#register #email').value,
                age: document.querySelector('#register #age').value,
                role: 'employee',
                late: [],
                attend: [],
                absent: []
            }

            Email.send({
                Host: "smtp.gmail.com",
                port: 2525,
                Username: 'mohamedengineer944@gmail.com',
                Password: 'pecrhmkrjxrbkrdg',
                To: 'mohamedengineer944@gmail.com',
                From: newUser.email,
                Subject: `Register Confirmation Email`,
                Body: `Hello Mr. ${newUser.firstname}, <br/>Welcome back!<br/> We are happy to be with our family<br/>Your username is: ${newUser.username} <br/>And Your Password is: ${newUser.password}`
            }).then(resp => {
                fetch('http://localhost:3000/users', {
                    ...fetch_options,
                    method: 'POST',
                    body: JSON.stringify(newUser)
                })
                    .then(response => {
                        alert('Congratulations! Your Account has been confirmed, you will get a username and password from your boss')
                    })
                    .catch(error => alert(error))
            })


        })
    }

    if (login_form) {
        login_form.addEventListener('submit', function (func) {
            func.preventDefault()
            func.stopPropagation()

            let username = document.querySelector('#login #username').value,
                password = document.querySelector('#login #password').value

            fetch(`http://localhost:3000/users?username=${username}&password=${password}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                })
                .then(jsonResponse => {
                    if (jsonResponse.length === 0) {
                        alert('Not Registered!')
                    } else {
                        alert('Welcome back! ' + username)
                        localStorage.setItem('user', JSON.stringify(jsonResponse[0]))

                        if (jsonResponse[0].role == 'admin') {
                            location.replace('./AdminPanel.html')
                        } else {
                            location.replace('./EmployeeProfile.html')
                        }
                    }
                })

        })
    }

    fetch(`http://localhost:3000/users`)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(jsonResponse => {
            jsonResponse.forEach(user => {
                $('select#confirm-attendance').append(new Option(`${user.firstname} ${user.lastname}`, user.id));
            })
        })

    //Employee Attendance Confirmation (Absencne-late-excused)
    $('#attend_butt').click(function (event) {

        event.preventDefault();
        event.stopPropagation();
        document.getElementById('up').style.display = 'none';
        document.getElementById('down').style.display = 'block';

        let tmpUser = null
        let id = $('#confirm-attendance').val();

        fetch(`http://localhost:3000/users?id=${id}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then(jsonResponse => {
                let now = new Date()
                tmpUser = jsonResponse[0]
                document.getElementById("employee_name").innerHTML += tmpUser.firstname;
                document.getElementById("employee_attend_time").innerHTML += now.toLocaleTimeString();
                    //from 8:00 AM to 8:20 AM 
                if (now.getHours() == 8 && now.getMinutes() < 20) {
                    tmpUser.attend.push(new Date().toLocaleDateString())
                    //from 8:20 AM to 8:59 AM  
                } else if ((now.getHours() == 8 && now.getMinutes() >= 20 && now.getMinutes() <= 59)) {
                    var r = confirm("Do you have Excuse?");

                    if (r == true) {
                        tmpUser.late.push(new Date().toLocaleDateString() + '- has excuse');
                    } else {
                        tmpUser.late.push(new Date().toLocaleDateString());
                    }

                } else {
                    tmpUser.absent.push(new Date().toLocaleDateString());
                }

                fetch(`http://localhost:3000/users/${tmpUser.id}`, {
                    ...fetch_options,
                    method: 'PUT',
                    body: JSON.stringify(tmpUser)
                })
                    .then(response => response.json())
                    .then(res => { localStorage.setItem('user', JSON.stringify(tmpUser)) })

            })

    })

    //Requesting and building employee reports from json server
    fetch(`http://localhost:3000/users`)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(jsonResponse => {
            if (jsonResponse) {
                console.log('jsonResponse==>', jsonResponse)

                jsonResponse.forEach(val => {
                    let excuseCount = 0;
                    let lateCount = 0;
                    val.late.forEach(val => {
                        if (!val.includes('has excuse')) {
                            lateCount++
                        } else {
                            excuseCount++
                        }
                    })
                    $('#all-reports').append(`<tr id="R${1}"> 
                    <td class=""> ${val.firstname} ${val.lastname}</td>
                    <td class="">${val.attend.length}</td> 
                    <td class=""> ${lateCount}</td> 
                    <td class=""> ${excuseCount}</td> 
                     </tr>`);

                    $('#full-reports').append(`<tr id="R${1}"> 
                    <td class=""> ${val.firstname} ${val.lastname}</td>
                    <td class="">${val.attend.length}</td> 
                    <td class=""> ${lateCount}</td> 
                    <td class=""> ${excuseCount}</td> 
                    <td class=""> ${val.absent.length}</td> 
                     </tr>`);

                    $('#late-reports').append(`<tr id="R${1}"> 
                     <td class=""> ${val.firstname} ${val.lastname}</td>
                     <td class=""> ${lateCount}</td> 
                      </tr>`);

                    $('#excuse-reports').append(`<tr id="R${1}"> 
                      <td class=""> ${val.firstname} ${val.lastname}</td>
                      <td class=""> ${excuseCount}</td> 
                       </tr>`);

                    $('#brief-reports').append(`<tr class="x" id="R${1}"> 
                      <td class=""> ${val.firstname} ${val.lastname}</td>
                      <td class="y"> ${val.age}</td> 
                      <td class=""> ${val.email}</td> 
                      <td class=""> ${val.address}</td> 
                       </tr>`);
                })
            }
        })


})

//Employee Profile daily and monthly report

jQuery('.showSingle').click(function () {
    jQuery('.targetDiv').hide();
    jQuery('#div' + $(this).attr('target')).show();
});

console.log(localStorage.getItem("user"));

async function getLoginedUser() {

    var d = new Date();

    let hour = d.getHours();
    let minutes = d.getMinutes();
    let seconds = d.getSeconds();
    await $.get("http://localhost:3000/users?username=" + JSON.parse(localStorage.getItem("user")).username, function (data) {

        console.log("from here", data);
        document.getElementById("empData").innerHTML = `
        <p><span> Employee Name </span>: ${data[0].firstname} ${data[0].lastname}</p>
        `
        document.getElementsByClassName("daily")[0].addEventListener("click", function () {
            document.getElementById("div1").innerHTML = `
                    <p><span>Full Name</span>: ${data[0].firstname} ${data[0].lastname}</p>
                    <p><span>User Name</span>: ${data[0].username}</p>
                    <p><span>Email</span>: ${data[0].email}</p>
                    <p><span>Age</span>: ${data[0].age}</p>
                    <p><span>Attendance Time</span>: ${hour}:${minutes}:${seconds}</p>
            `
        })

        document.getElementsByClassName("monthly")[0].addEventListener("click", function () {
            document.getElementById("div2").innerHTML = `
                        <p><span>Attendance Times</span>: ${data[0].attend.length}</p>
                        <p><span>Late Times</span>: ${data[0].late.length}</p>
                        <p><span>Absence Times</span>: ${data[0].absent.length} </p>
                        
                `
        })
        document.getElementById("down").innerHTML = `

        <div class="mb-3 show-data">
               <p><span>Employee Name</span>: ${data[0].firstname} ${data[0].lastname}</p>
               <p><span>Attendance Time</span>: ${hour}:${minutes}:${seconds}</p>
               <button id="closebtn" type="button" class="btn btn-danger">Close</button>

        </div>

       `

        document.getElementById("closebtn").addEventListener("click", function () {
            $(this).parent().hide(800)
        })

        document.getElementsByClassName("empCard")[0].innerHTML = `
        <p><span> Employee Name </span>: ${data[0].firstname} ${data[0].lastname}</p>
    
`
    })
}

getLoginedUser()



