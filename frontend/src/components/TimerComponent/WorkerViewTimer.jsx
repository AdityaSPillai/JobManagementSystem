import { useEffect, useState } from 'react';

const formatSecondsToHMS = (totalSeconds = 0) => {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    return `${String(h).padStart(2, '0')}:` +
        `${String(m).padStart(2, '0')}:` +
        `${String(s).padStart(2, '0')}`;
};

export default function WorkerViewTimer({
    worker,
    employee,
}) {
    const [tick, setTick] = useState(0);

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

    const formatDateTime = (isoString) => {
        if (!isoString) return '-';

        const date = new Date(isoString);

        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <tr>
            <td>{employee?.name || 'Unknown'}</td>
            <td>{employee?.employeeNumber || worker.workerAssigned}</td>
            <td>{formatDateTime(worker.startTime)}</td>
            <td>{formatDateTime(worker.endTime)}</td>
            <td>
                <div className="worker-actions">
                    {!!worker.startTime && !!worker.endTime ? (
                        <span className="worker-stopped">
                            {formatSecondsToHMS(displayDuration)} Ended
                        </span>
                    ) : (
                        <>
                            <label className="worker-btn start">
                                {formatSecondsToHMS(displayDuration) || "00:00:00"}
                            </label>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}