import { useEffect, useState } from 'react';

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

export default function MachineSupTimer({ machine, selectedJobStatus, onRemoveMachine }) {
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

    return (
        <tr>
            <td>{machine.machineRequired?.name || 'Unknown Machine'}</td>
            <td>{machine.machineRequired?._id || 'N/A'}</td>

            <td>
                {!!machine.startTime && !!machine.endTime ? (
                    <span className="worker-stopped">
                        {formatSecondsToHMS(displayDuration)} Ended
                    </span>
                ) : (
                    <span className="worker-btn start">
                        {formatSecondsToHMS(displayDuration)}
                    </span>
                )}
            </td>

            <td>
                <button
                    type="button"
                    className="worker-btn stop"
                    onClick={() =>
                        onRemoveMachine(machine.machineRequired?._id)
                    }
                    disabled={
                        selectedJobStatus === 'approved' ||
                        selectedJobStatus === 'completed'
                    }
                >
                    Remove
                </button>
            </td>
        </tr>
    );
}