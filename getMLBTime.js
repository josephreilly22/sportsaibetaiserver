
const getMLBTime = (time) => {
    const hourAndMin = time.split(":");
    let hour = Number(time.split(":")[0]);
    const minute = hourAndMin[1].replace('Z','');
    if (hour <= 2) {
        hour += 24;
    }
    hour = hour - 4;
    if (hour > 12) {
        hour -= 12;
    }
    return `${hour}:${minute} PM`;
}

module.exports = { getMLBTime };
