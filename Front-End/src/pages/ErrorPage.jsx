import './ErrorPage.css'
import { Link } from 'react-router-dom'
const ErrorPage = () => {
  return (
    <div className='error-page'>
        <h1 className='error-heading'>Error Page</h1>
        <p className="zoom-area"><b>Page</b> Not Found </p>
        <section className="error-container">
            <span className="four"><span className="screen-reader-text">4</span></span>
            <span className="zero"><span className="screen-reader-text">0</span></span>
            <span className="four"><span className="screen-reader-text">4</span></span>
        </section>
        <div className="link-container">
            <Link to='/home'>Visit the Home Page</Link>
        </div>
    </div>
  )
}

export default ErrorPage