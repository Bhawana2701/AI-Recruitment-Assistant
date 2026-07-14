//AIInterview.jsx
import Layout from "../../components/Layout";
import { useParams } from "react-router-dom";
import "./AIInterview.css";
import { useState, useRef } from "react";
import { useEffect } from "react";
import api from "../../api/api";
import BeyondPresenceAvatar from "../../components/BeyondPresenceAvatar";
import BrowserMonitor from "../../components/Proctoring/BrowserMonitor";
// import FaceMonitor from "../../components/Proctoring/FaceMonitor";
import CameraMonitor from "../../components/Proctoring/CameraMonitor";
import { useNavigate } from "react-router-dom";

import { sendLog } from "../../api/proctorApi";



export default function AIInterview() {

    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [validInterview, setValidInterview] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [micReady, setMicReady] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [verified, setVerified] = useState(false);
    const [applicationId, setApplicationId] = useState(null);
    const recorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const videoRef = useRef(null);
    const [interviewEnded, setInterviewEnded] = useState(false);
    const DEMO_MODE = false;

    

    const navigate = useNavigate();

    const [ending, setEnding] = useState(false);

   const endInterview = async () => {
        setEnding(true);
        setInterviewEnded(true);

        try {
            await sendLog(
                applicationId,
                "INTERVIEW_ENDED",
                "LOW",
                "Interview completed."
            );
        } catch (err) {
            console.error("Failed to log interview end:", err);
        }

        if (
            recorderRef.current &&
            recorderRef.current.state !== "inactive"
        ) {
            recorderRef.current.stop();
        }
    };
   const verifyInterview = async () => {

        try {

            const res = await api.get(`/verify-interview/${token}`);

            setValidInterview(res.data.valid);
            const id = Number(res.data.application_id);

            console.log("Application ID from backend:", id);

            setApplicationId(id);
        } catch (err) {

            console.log(err);

            setValidInterview(false);

        } finally {

            setLoading(false);

        }

    };
    useEffect(() => {
        verifyInterview();
    }, [token]);

    const startCamera = async () => {

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            videoRef.current.srcObject = mediaStream;
            await videoRef.current.play();

            const recorder = new MediaRecorder(mediaStream);

            recorderRef.current = recorder;

            recordedChunksRef.current = [];

            recorder.ondataavailable = (event) => {

                if (event.data.size > 0) {

                    recordedChunksRef.current.push(event.data);

                }

            };

            recorder.onstop = async () => {
                const blob = new Blob(recordedChunksRef.current, {
                    type: "video/webm",
                });

                const formData = new FormData();
                formData.append("application_id", applicationId);
                formData.append("video", blob, "interview.webm");

                try {
                    await api.post("/upload-interview-video", formData);

                    // Stop camera AFTER upload
                    videoRef.current?.srcObject
                        ?.getTracks()
                        .forEach(track => track.stop());

                    // Exit fullscreen (optional)
                    if (document.fullscreenElement) {
                        await document.exitFullscreen();
                    }

                    alert("Interview submitted successfully!");
                    navigate("/");
                } catch (err) {
                        console.error(err);

                        setEnding(false);
                        setInterviewEnded(false);

                        alert("Upload failed. Please try again.");
                    }
            };
            
            try {

                await document.documentElement.requestFullscreen();
                sendLog(
                    applicationId,
                    "INTERVIEW_STARTED",
                    "LOW",
                    "Candidate started interview."
                );

            } catch (err) {

                console.log("Fullscreen blocked");

            }

            console.log("Video Width:", videoRef.current.videoWidth);
            console.log("Video Height:", videoRef.current.videoHeight);
            console.log("Ready State:", videoRef.current.readyState);

            
            recorder.start();

            setCameraReady(true);

            setMicReady(true);

            setTimeout(() => {

                setFaceDetected(true);

                setVerified(true);

            }, 1000);

        } catch (err) {

            console.log(err);

        }

    };

    useEffect(() => {

        return () => {

            if (videoRef.current?.srcObject) {

                videoRef.current.srcObject
                    .getTracks()
                    .forEach(track => track.stop());

            }

        };

    }, []);

    if (loading) {
        return (
            <Layout>
                <h2>Checking Interview...</h2>
            </Layout>
        );
    }

    if (!validInterview) {
        return (
            <Layout>
                <h2>❌ Invalid or Expired Interview Link</h2>
            </Layout>
        );
    }

   

    return (
        <Layout>

            {applicationId && verified && !interviewEnded && (
                <div>
                    <BrowserMonitor
                        applicationId={applicationId}
                    />
                    <CameraMonitor
                        applicationId={applicationId}
                    />

                </div>
            )}
            <div className="ai-interview-container">

                <h1>AI Interview</h1>

                <h3>Interview Session</h3>
                <p>Session ID: {token}</p>

               <div className="interview-screen">

                    <div className="avatar-box">

                        <BeyondPresenceAvatar />

                    </div>

                    <div className="verification-box">

                        <h3>Verification Status</h3>

                        <p>
                            {cameraReady ? "✅ Camera Connected" : "❌ Camera Not Connected"}
                        </p>

                        <p>
                            {micReady ? "✅ Microphone Connected" : "❌ Microphone Not Connected"}
                        </p>

                        <p>
                            {faceDetected ? "✅ Face Detected" : "⏳ Detecting Face..."}
                        </p>

                    </div>

                    <div className="candidate-box">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: "320px",
                                height: "240px",
                                border: "2px solid red"
                            }}
                        />
                    </div>
                 </div>

                {verified && (
                    <div className="recording-box">
                        🔴 Interview is being securely recorded for evaluation.
                    </div>
                )}

               <button
                    className="start-btn"
                    onClick={startCamera}
                    disabled={verified}
                >
                    {verified ? "Verification Complete" : "Start Verification"}
                </button>

                {verified && (
                    <button
                        className="end-btn"
                        onClick={endInterview}
                        disabled={ending}
                    >
                        {ending ? "Submitting..." : "End Interview"}
                    </button>
                )}
            </div>

        </Layout>
    );
}