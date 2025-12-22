import { useEffect, useState } from 'react';

// seconds → HH:MM:SS
const formatSecondsToHMS = (totalSeconds = 0) => {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    return (
        `${String(h).padStart(2, '0')}:` +
        `${String(m).padStart(2, '0')}:` +
        `${String(s).padStart(2, '0')}`
    );
};

export default function MachineTimer({
    machine,
    selectedJobStatus,
    isPaused,
    onStart,
    onPause,
    onStop
}) {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!machine.startTime || machine.endTime) return;

        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [machine.startTime, machine.endTime]);

    let displayDuration = machine.actualDuration || 0;

    if (machine.startTime && !machine.endTime) {
        displayDuration += Math.floor(
            (Date.now() - new Date(machine.startTime).getTime()) / 1000
        );
    }

    const isStopped = !!machine.endTime;
    const isRunning = !!machine.startTime && !machine.endTime && !isPaused;
    const isCompleted = selectedJobStatus === 'completed';

    return (
        <tr>
            <td>{machine.machineRequired || 'Unknown'}</td>
            <td>{machine.machineId || 'N/A'}</td>
            <td>
                <div className="worker-actions">
                    {isStopped && selectedJobStatus !== 'rejected' ? (
                        <span className="worker-stopped">
                            {formatSecondsToHMS(displayDuration)} Ended
                        </span>
                    ) : selectedJobStatus === 'waiting' ? (
                        <span className="consumable-waiting">
                            Waiting for Manager Approval
                        </span>
                    ) : (
                        <>
                            <button
                                className="worker-btn start"
                                disabled={isRunning || isCompleted || selectedJobStatus === 'approved'}
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
                                disabled={!machine.startTime}
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