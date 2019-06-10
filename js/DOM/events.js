//
// ────────────────────────────────────────────────────────────────────── I ──────────
//   :::::: H A N D L I N G   E V E N T S : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────────────
//

const btnMousedown = document.getElementById('btn-mousedown');
// the argument passed to the callback function is the event listener object
btnMousedown.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        console.log('Left button', event);
    } else if (event.button === 0) {
        console.log('Middle button', event);
    } else if (event.button === 2) {
        console.log('Right button', event);
    }
});

const paragClick = document.getElementById('parag-click');
const btnClick = document.getElementById('btn-click');
paragClick.addEventListener('click', () => {
    console.log('Parag click event handler');
});
btnClick.addEventListener('click', (event) => {
    console.log('Btn click event handler');
    event.stopPropagation();
});
