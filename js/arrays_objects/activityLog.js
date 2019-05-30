/* Arrays and Objects */

/* eslint-disable no-unused-vars */

function addEntry(events, squirrel, journal) {
    journal.push({ events, squirrel });
}

// calculate the correlation between 2 events based on phi formula
function phi(table) {
    return (table[3] * table[0] - table[2] * table[1])
        / Math.sqrt((table[3] + table[2])
                 * (table[0] + table[1])
                 * (table[3] + table[1])
                 * (table[0] + table[2]));
}
// create the table for every event in the journal
// this table is needed to calculate the correlation
function tableFor(event, journal) {
    const table = [0, 0, 0, 0];
    for (const entry of journal) {
        let index = 0;
        if (entry.events.includes(event)) index += 1;
        if (entry.squirrel) index += 2;
        table[index] += 1;
    }
    return table;
}

// create an array of all the non repeating events
function findEvents(journal) {
    const eventList = [];
    for (const entry of journal) {
        for (const event of entry.events) {
            if (!eventList.includes(event)) {
                eventList.push(event);
            }
        }
    }
    return eventList;
}

// display the correlation between events and "squirrel" transformation
function showCorrelation(journal) {
    for (const event of findEvents(journal)) {
        const correlation = phi(tableFor(event, journal));
        // the text displayed
        const observation = `${event}  :  ${correlation}`;
        // filter out events with little likelihood of influencing the transformation
        if (correlation > 0.1 || correlation < -0.1) {
            console.log(observation);
        }
        if (correlation === 1) {
            console.log(`Evident correlation -> ${observation}`);
        }
    }
}

// search correlation between the absence and presence of 2 events
// negEvent - the event which prevents the transformation
// pozEvent - the event which favors the transformation
function searchCorrelation(negEvent, pozEvent, journal) {
    for (const entry of journal) {
        const eventList = entry.events;
        // only squirrel transformation days interest us
        if (entry.squirrel === true) {
            // if the negEvent is missing and the pozEvent persists
            if (!eventList.includes(negEvent) && eventList.includes(pozEvent)) {
                console.log('Found correlation.');
                const mixedEvent = `${pozEvent}, no ${negEvent}`;
                if (!eventList.includes(mixedEvent)) {
                    eventList.push(mixedEvent);
                }
            }
        }
    }
}
