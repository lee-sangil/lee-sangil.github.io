export function getCanvasRelativePosition(e, canvas){
    const rect = canvas.getBoundingClientRect();
    console.log(canvas.width/rect.width );
    return {
        x: (e.clientX - rect.left) / rect.width  * canvas.width / 2,
        y: (e.clientY - rect.top ) / rect.height * canvas.height / 2,
    };
}