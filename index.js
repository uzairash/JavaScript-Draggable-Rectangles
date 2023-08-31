const rectangles = [
  { id: 1, src: "img1.jpg", startX: 200, startY: 100, MstartX: 50, MstartY: 100 },
  { id: 2, src: "img2.jpg", startX: 1200, startY: 100, MstartX: 250, MstartY: 300 },
  { id: 3, src: "img3.jpg", startX: 700, startY: 500, MstartX: 50, MstartY: 500 },
  // add more rectangles as needed
];
for (let i = 0; i < rectangles.length; i++) {
  const rectangle = document.createElement("img");

  rectangle.src = rectangles[i].src;

  const query = window.matchMedia("(min-width: 600px)");
  if (query.matches) {
    rectangle.style.width = "400px";
    rectangle.style.height = "250px";
  } else {
    rectangle.style.width = "250px";
    rectangle.style.height = "150px";
  }

  rectangle.style.position = "absolute";
  rectangle.style.left = rectangles[i].startX + "px";
  rectangle.style.top = rectangles[i].startY + "px";
  if (!query.matches) {
    rectangle.style.left = rectangles[i].MstartX + "px";
    rectangle.style.top = rectangles[i].MstartY + "px";
  }

  document.body.append(rectangle);
  makeRectangleDraggable(
    rectangle,
    query.matches ? rectangles[i].startX : rectangles[i].MstartX,
    query.matches ? rectangles[i].startY : rectangles[i].MstartY
  );
}

function makeRectangleDraggable(rectangle, startX, startY) {
  rectangle.addEventListener("mousedown", onMouseDown);
  rectangle.addEventListener("touchstart", onMouseDown, { passive: true });

  rectangle.addEventListener("dragstart", function (event) {
    event.preventDefault();
  });

  let isDragging = false;
  let lastX = 0;
  let lastY = 0;

  function onMouseDown(event) {
    event.preventDefault();

    let shiftX, shiftY;
    if (event.type === "mousedown") {
      shiftX = event.clientX - rectangle.getBoundingClientRect().left;
      shiftY = event.clientY - rectangle.getBoundingClientRect().top;
    } else if (event.type === "touchstart") {
      shiftX = event.changedTouches[0].clientX - rectangle.getBoundingClientRect().left;
      shiftY = event.changedTouches[0].clientY - rectangle.getBoundingClientRect().top;
    }

    rectangle.style.zIndex = 1000;
    document.body.append(rectangle);

    isDragging = true;

    function moveAt(pageX, pageY) {
      let x = pageX - shiftX;
      let y = pageY - shiftY;

      // get the current scroll position
      let scrollX = window.scrollX || window.pageXOffset;
      let scrollY = window.scrollY || window.pageYOffset;

      // get the current viewport dimensions
      let viewportWidth = document.documentElement.clientWidth;
      let viewportHeight = document.documentElement.clientHeight;

      // get the dimensions of the dragged element
      let elementWidth = rectangle.offsetWidth;
      let elementHeight = rectangle.offsetHeight;

      // calculate the maximum allowed position
      let maxX = scrollX + viewportWidth - elementWidth;
      let maxY = scrollY + viewportHeight - elementHeight;

      // clamp the x and y positions to the maximum allowed values
      x = Math.min(Math.max(x, scrollX), maxX);
      y = Math.min(Math.max(y, scrollY), maxY);
      // throttle the moveAt function to reduce computation
      if (x !== lastX || y !== lastY) {
        requestAnimationFrame(() => {
          rectangle.style.transform = `translate(${x - startX}px, ${y - startY}px)`;
        });
        lastX = x;
        lastY = y;
      }
    }

    function onMouseMove(event) {
      event.preventDefault();

      if (event.type === "mousemove") {
        moveAt(event.pageX, event.pageY);
      } else if (event.type === "touchmove") {
        moveAt(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onMouseMove, { passive: true });

    function onMouseUp(event) {
      event.preventDefault();

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchmove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchend", onMouseUp);

      isDragging = false;
    }

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchend", onMouseUp, { passive: true });

    // reset lastX and lastY when dragging starts
    lastX = 0;
    lastY = 0;
  }

  // prevent scrolling while dragging
  document.addEventListener(
    "touchmove",
    (event) => {
      if (isDragging) {
        event.preventDefault();
      }
    },
    { passive: false }
  );
}
