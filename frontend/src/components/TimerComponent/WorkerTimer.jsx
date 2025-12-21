import { useEffect, useState } from 'react';

// seconds → HH:MM:SS
const formatSecondsToHMS = (totalSeconds = 0) => {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    return `${String(h).padStart(2, '0')}:` +
        `${String(m).padStart(2, '0')}:` +
        `${String(s).padStart(2, '0')}`;
};

export default function WorkerTimer({
    worker,
    employee,
    selectedJobStatus,
    isPaused,
    onStart,
    onPause,
    onStop
}) {
    const [tick, setTick] = useState(0);

    // ⏱ only THIS ROW rerenders
    useEffect(() => {
        if (!worker.startTime || worker.endTime) return;

        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [worker.startTime, worker.endTime]);

    let displayDuration = worker.actualDuration || 0;

    if (worker.startTime && !worker.endTime) {
        displayDuration += Math.floor(
            (Date.now() - new Date(worker.startTime).getTime()) / 1000
        );
    }

    const isStopped = !!worker.endTime;
    const isRunning = !!worker.startTime && !worker.endTime && !isPaused;

    return (
        <tr>
            <td>{employee?.name || 'Unknown'}</td>
            <td>{employee?.employeeNumber || worker.workerAssigned}</td>

            <td>
                <div className="worker-actions">
                    {isStopped && selectedJobStatus !== 'rejected' ? (
                        <span className="worker-stopped">
                            {formatSecondsToHMS(displayDuration)} Stopped
                        </span>
                    ) : (
                        <>
                            <button
                                className="worker-btn start"
                                disabled={isRunning}
                                onClick={onStart}
                            >
                                {isRunning
                                    ? formatSecondsToHMS(displayDuration)
                                    : 'Start'}
                            </button>

                            <button
                                className="worker-btn pause"
                                disabled={!isRunning}
                                onClick={onPause}
                            >
                                Pause
                            </button>

                            <button
                                className="worker-btn stop"
                                disabled={!worker.startTime}
                                onClick={onStop}
                            >
                                Stop
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}