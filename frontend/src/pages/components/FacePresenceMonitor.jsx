import { useEffect, useRef, useState } from 'react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import API from '../../api/axios';

const VISION_WASM_PATH =
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm';
const FACE_MISSING_AFTER_MS = 8000;

export default function FacePresenceMonitor({ sessionId }) {
    const videoRef = useRef(null);
    const cameraUnavailableReportedRef = useRef(false);
    const [cameraStatus, setCameraStatus] = useState('Starting camera...');
    const [errorMessage, setErrorMessage] = useState('');
    const [retryAttempt, setRetryAttempt] = useState(0);

    useEffect(() => {
        let active = true;
        let stream = null;
        let videoTrack = null;
        let detector = null;
        let intervalId = null;
        let missingSince = null;
        let faceMissingReported = false;

        const reportEvent = async (eventType) => {
            try {
                await API.post(`/sessions/${sessionId}/events`, {
                    event_type: eventType,
                });
                return true;
            } catch (error) {
                if (active) {
                    const detail =
                        error.response?.data?.detail ||
                        error.message ||
                        'Request failed';
                    setErrorMessage(`Could not save ${eventType} event: ${detail}`);
                }
                return false;
            }
        };

        const reportCameraUnavailable = async (message) => {
            setCameraStatus('Camera unavailable');
            setErrorMessage(message);
            if (!cameraUnavailableReportedRef.current) {
                cameraUnavailableReportedRef.current = true;
                await reportEvent('CAMERA_UNAVAILABLE');
            }
        };

        const stopStream = () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
                if (videoRef.current?.srcObject === stream) {
                    videoRef.current.srcObject = null;
                }
                stream = null;
            }
        };

        const checkFace = () => {
            const video = videoRef.current;
            if (!active || !detector || !video || video.readyState < 2) return;

            try {
                const result = detector.detectForVideo(video, performance.now());
                if (result.detections.length > 0) {
                    missingSince = null;
                    faceMissingReported = false;
                    setCameraStatus('Face detected');
                    setErrorMessage('');
                    return;
                }

                if (missingSince === null) {
                    missingSince = Date.now();
                }

                if (Date.now() - missingSince >= FACE_MISSING_AFTER_MS) {
                    setCameraStatus('No face detected');
                    if (!faceMissingReported) {
                        faceMissingReported = true;
                        void reportEvent('FACE_MISSING');
                    }
                } else {
                    setCameraStatus('Checking for face...');
                }
            } catch (error) {
                setCameraStatus('Face detection stopped');
                setErrorMessage(error.message || 'Face detection failed.');
                window.clearInterval(intervalId);
            }
        };

        const handleTrackEnded = () => {
            if (active) {
                void reportCameraUnavailable('The camera disconnected during the exam.');
            }
        };

        const startMonitoring = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                await reportCameraUnavailable(
                    'Camera access is not available. Use a supported browser on localhost or HTTPS.'
                );
                return;
            }

            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                    },
                    audio: false,
                });
            } catch (error) {
                if (active) {
                    const message = error.name === 'NotAllowedError'
                        ? 'Camera permission was denied. Allow camera access, then retry.'
                        : error.name === 'NotFoundError'
                            ? 'No camera was found.'
                            : error.message || 'Could not access the camera.';
                    await reportCameraUnavailable(message);
                }
                return;
            }

            if (!active) {
                stopStream();
                return;
            }

            const video = videoRef.current;
            if (!video) {
                stopStream();
                return;
            }

            video.srcObject = stream;

            try {
                await video.play();
                const vision = await FilesetResolver.forVisionTasks(VISION_WASM_PATH);
                detector = await FaceDetector.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `${import.meta.env.BASE_URL}models/blaze_face_short_range.tflite`,
                        delegate: 'CPU',
                    },
                    runningMode: 'VIDEO',
                    minDetectionConfidence: 0.6,
                });
            } catch (error) {
                if (active) {
                    setCameraStatus('Face detection unavailable');
                    setErrorMessage(error.message || 'Could not initialize face detection.');
                }
                stopStream();
                return;
            }

            if (!active) {
                detector.close();
                detector = null;
                stopStream();
                return;
            }

            videoTrack = stream.getVideoTracks()[0];
            videoTrack?.addEventListener('ended', handleTrackEnded);
            cameraUnavailableReportedRef.current = false;
            setCameraStatus('Face monitoring active');
            intervalId = window.setInterval(checkFace, 1000);
        };

        void startMonitoring();

        return () => {
            active = false;
            window.clearInterval(intervalId);
            videoTrack?.removeEventListener('ended', handleTrackEnded);
            stopStream();
            detector?.close();
        };
    }, [sessionId, retryAttempt]);

    const retryCamera = () => {
        setCameraStatus('Starting camera...');
        setErrorMessage('');
        setRetryAttempt((attempt) => attempt + 1);
    };

    return (
        <section aria-label="Webcam face-presence monitoring" style={styles.container}>
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={styles.video}
            />
            <p aria-live="polite">{cameraStatus}</p>
            {errorMessage && <p role="alert">{errorMessage}</p>}
            {(cameraStatus === 'Camera unavailable' ||
                cameraStatus === 'Face detection unavailable') && (
                <button
                    type="button"
                    onClick={retryCamera}
                >
                    Retry camera
                </button>
            )}
        </section>
    );
}

const styles = {
    container: { marginTop: '20px' },
    video: {
        width: '100%',
        maxWidth: '360px',
        borderRadius: '8px',
        backgroundColor: '#111827',
    },
};
