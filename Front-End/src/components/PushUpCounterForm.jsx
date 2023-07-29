/* eslint-disable no-mixed-spaces-and-tabs */
import { Upload, Button, message, Typography } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import {useState} from 'react'
import axios from 'axios'
import './PushUpCounterForm.css'

const PushUpCounterForm = () => {
	const { Title } = Typography;
	const { Dragger } = Upload;
	const [videoFile, setVideoFile] = useState(null);
	const [result, setResult] = useState('')
	const [loading, setLoading] = useState(false);

	const handleVideoChange = (info) => {
    // We only allow a single file to be uploaded
    const fileList = info.fileList.slice(-1);

    // Update the state with the selected video file
    setVideoFile(fileList[0].originFileObj);
  };

	const handleUpload = async () => {
		try {
			if(!videoFile) {
				message.error('Please upload a video file first');
				return;
			}

			const formData = new FormData();
			formData.append('video', videoFile);
			setResult('Processing...');
			setLoading(true);
			const response = await axios.post('http://localhost:3001/upload/', formData);
			setLoading(false);
			if (response.data) {
        message.success('Processed successfully');
        setResult(response.data.push_up_count);
      } else {
        message.error('Failed to get the push-up count');
      }
		} catch (err) {
				console.log(err);
				message.error('An Error occurred while processing the video.');
		}
	}



  return (
	<div className='pushUpCounterForm'>
		<Title style={{color: 'white', fontSize: '35px'}}>Push Up Counter App</Title>
		<Dragger
			customRequest={()=> {}} //Prevent automatic upload
			fileList={videoFile ? [videoFile] : []}
			onChange={handleVideoChange}
			onRemove={() => setVideoFile(null)}
			className='dragger'
		>
  		<p className="ant-upload-drag-icon dragger_p">
  		  <InboxOutlined />
  		</p>
  		<p className="ant-upload-text dragger_p">Click or drag file to this area to upload</p>
  		<p className="ant-upload-hint dragger_p">
  		  We need your PushUp Video to be uploaded here
  		</p>
  	</Dragger>

		<Button className='submit-btn' onClick={() => handleUpload()} disabled={loading}>
			{loading ? 
			  <div className="loading">
				<span className="loading-dots">🔥</span>
				<p className="loading-text">Loading</p>
			  </div> :
			  <span>Process Video</span>
			}
			
		</Button>
		{result && <h1 style={{color: 'white'}}>Push-up count: {result}</h1>}
	</div>
    
  )
}

export default PushUpCounterForm