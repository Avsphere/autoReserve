//like other standalones in this folder, this is intended to operate on the scheduler page

const inputCredentials = ({
    username,
    password
}) => {
    document.querySelector('#loginFormWrapper').style.display = 'block'; //for click to work, el must be visible
    document.querySelector('#dnn_LOGINFORM_Login_DNN_chkCookie').checked = true; //perhaps unnecessary
    document.querySelector('#dnn_LOGINFORM_Login_DNN_txtUsername').value = username
    document.querySelector('#dnn_LOGINFORM_Login_DNN_txtPassword').value = password
}


const login = ({ page, username, password }) => page
    .evaluate(inputCredentials, {
        username,
        password
    })
    .then(_ => page.click('#dnn_LOGINFORM_Login_DNN_cmdLogin'))


module.exports = login;