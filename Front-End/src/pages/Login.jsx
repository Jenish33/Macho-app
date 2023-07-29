import { Button, Typography } from "antd"
import Macho from '../assets/macho.png'
import glogo from '../assets/google.png'
import './Login.css'

const Login = () => {
	const { Title } = Typography
	// eslint-disable-next-line no-undef
	const URL = "http://localhost:3001/auth/google"
	console.log("URL",URL)

  return (
		<div className="login-container">
			<div className="logo-container">
				<img src={Macho} alt="Macho" style={{width: '500px', height: '500px'}}/>
				<a href={URL}>
					<Button className='signin-btn'><img src={glogo} style={{marginRight:'10px'}}/>Sign Up with Google</Button>
				</a>
			</div>
			<Title style={{color: 'orange', fontSize: '35px', margin:'40px'}}>Push-up Counter App</Title>
		</div>
    
  )
}

export default Login