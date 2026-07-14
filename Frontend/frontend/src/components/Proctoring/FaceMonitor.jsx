// FaceMonitor.jsx
import { useEffect } from "react";
import * as faceapi from "face-api.js";
import { sendLog } from "../../api/proctorApi";

export default function FaceMonitor({
    videoRef,
    applicationId
}) {

    useEffect(() => {

        let interval;

        async function loadModels() {

            // Load AI model
            await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

            console.log("✅ Models Loaded");

            // Check every second
            await new Promise((resolve) => {
                videoRef.current.onloadeddata = resolve;
            });

            console.log("Video Loaded");
            interval = setInterval(async () => {

               if (!videoRef.current) {
                    console.log("Video element not found");
                    return;
                }

                console.log("------------");
                console.log("readyState:", videoRef.current.readyState);
                console.log("videoWidth:", videoRef.current.videoWidth);
                console.log("videoHeight:", videoRef.current.videoHeight);
                console.log("paused:", videoRef.current.paused);
                console.log("ended:", videoRef.current.ended);

                if (videoRef.current.readyState !== 4) {
                    console.log("Video not ready");
                    return;
                }

                const detection = await faceapi.detectSingleFace(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                );

                console.log("Detection:", detection);

                console.log(detection);
                if (detection) {
                    console.log("😊 Face Detected");
                } else {
                    console.log("❌ No Face");

                    if (applicationId) {
                        sendLog(
                            applicationId,
                            "NO_FACE",
                            "HIGH",
                            "Candidate left the camera."
                        );
                    }
                }

            }, 1000);
        }

        loadModels();

        return () => clearInterval(interval);

    }, [applicationId]);

    return null;
}