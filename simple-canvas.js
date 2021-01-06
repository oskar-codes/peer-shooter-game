window.SimpleCanvas = {
  init: () => {},
  update: () => {}
};

SimpleCanvas.setupCanvas = (ctx) => {
  function loop(timestamp) {
    if (lastRender === 0) {
      SimpleCanvas.init();
    }
    var progress = timestamp - lastRender
  
    SimpleCanvas.update(progress);
  
    lastRender = timestamp
    window.requestAnimationFrame(loop)

    xScroll = 0;
    yScroll = 0;
  }
  
  var lastRender = 0
  window.requestAnimationFrame(loop);
  
  /*** GLOBAL FUNCTIONS ***/

  SimpleCanvas.btn = (k) => {
    if (!!k) {
      try {
        return KEY[k][1];
      } catch(e) {
        console.error(`Key "${k}" is not a valid key.`);
      }
    } else {
      var arr = [];
      var keys = Object.keys(KEY);
      for (var i = 0; i<keys.length; i++) {
        if (KEY[keys[i]][1]) {
          arr.push(keys[i]);
        }
      }
      return arr;
    }
  }
  SimpleCanvas.cls = (c) => !!c ? rectfill(0,0,ctx.canvas.width,ctx.canvas.height,c) : ctx.clearRect(0,0,ctx.canvas.clientWidth,ctx.canvas.clientHeight);
  SimpleCanvas.rect = function(a,b,c,d,e,f) {
    e = (!!e ? e : "#000000");
    f = (!!f ? f : 1);
    ctx.strokeStyle = e;
    ctx.lineWidth = f;
    ctx.strokeRect(a,b,c,d);
  }
  SimpleCanvas.rectfill = function(a,b,c,d,e) {
    e = (!!e ? e : "#000000");
    ctx.fillStyle = e;
    ctx.fillRect(a,b,c,d);
  }
  SimpleCanvas.circ = function(x,y,r,c,s) {
    c = (!!c ? c : "#000000");
    s = (!!s ? s : 1);
    ctx.beginPath();
    ctx.strokeStyle = c;
    ctx.lineWidth = s;
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();
  }
  SimpleCanvas.circfill = function(x,y,r,c) {
    c = (!!c ? c : "#000000");
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = c;
    ctx.fill();
  }
  SimpleCanvas.line = function(x1,y1,x2,y2,c,s) {
    c = (!!c ? c : "#000000");
    s = (!!s ? s : 1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = c;
    ctx.lineWidth = s;
    ctx.stroke();
  }
  SimpleCanvas.text = function(t,x,y,c,s,f) {
    c = (!!c ? c : "#000000");
    s = (!!s ? s : 16);
    f = (!!f ? f : "sans-serif");
    ctx.font = s + "px " + f;
    ctx.fillStyle = c;
    ctx.fillText(t,x,y);
  }
  SimpleCanvas.textwidth = function(t, s, f) {
    s = (!!s ? s : 16);
    f = (!!f ? f : "sans-serif");
    ctx.font = s + "px " + f;
    var metrics = ctx.measureText(t);
    return metrics.width;
  }
  SimpleCanvas.pset = function(x,y,c) {
    c = (!!c ? c : "#000000");
    ctx.fillStyle = c;
    ctx.fillRect(x,y,1,1);
  }
  SimpleCanvas.pget = function(x,y,t) {
    t = (!!t ? t : 0);
    var data = ctx.getImageData(x,y,1,1).data;
    data[3]/=255;
    switch (t) {
      case 0: return `rgba(${data[0]},${data[1]},${data[2]},${data[3]})`;
      case 1: return RGBAToHex(data[0],data[1],data[2],data[3]);
      case 2: return [...data];
    }
  }
  SimpleCanvas.img = function(src,x,y,w,h) {
    var img = document.querySelector("img[src='"+ src +"']")

    if (!!img) {
      if (!!w && !!h) {
        ctx.drawImage(img,x,y,w,h);
      } else {
        ctx.drawImage(img,x,y);
      }
    } else {
      var img = new Image();
      img.src = src;
      img.setAttribute("data-x",x);
      img.setAttribute("data-y",y);
      img.setAttribute("data-w",w);
      img.setAttribute("data-h",h);
      
      var container = document.getElementById("simple-canvas-image-cache-container");
      if (!container) {
        container = document.createElement("div");
        container.setAttribute("id","simple-canvas-image-cache-container");
        container.style.display = "none";
        document.body.appendChild(container);
      }
      container.appendChild(img);
      img.onload = function() {
        var w = attr(this,"w");
        var h = attr(this,"h");
        if (!!w && !!h) {
          ctx.drawImage(this,parseInt(attr(this,"x")),parseInt(attr(this,"y")),w,h);
        } else {
          ctx.drawImage(this,parseInt(attr(this,"x")),parseInt(attr(this,"y")));
        }
      }
    }
  }
  const attr = (e,n) => e.getAttribute("data-"+n) === undefined ? undefined : parseInt(e.getAttribute("data-"+n));
  SimpleCanvas.mouse = function() {
    return [mouseX, mouseY];
  }
  var mouseX = 0;
  var mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    var rect = ctx.canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left
    mouseY = e.clientY - rect.top;
  });
  SimpleCanvas.mousedown = (id) => (id === 0 ? lmbDown : (id === 1 ? (rmbDown && prevContextMenus) : lmbDown));
  SimpleCanvas.preventcontextmenu = () => { prevContextMenus = true; }
  SimpleCanvas.cursor = (t) => {
    t = (!!t ? t : "auto");
    document.documentElement.style.cursor = t;
  }
  SimpleCanvas.getscrolldelta = (d) => d === 0 ? yScroll : (d === 1 ? xScroll : 0);

  /*** HANDLE INPUT ***/
  var KEY = {
    BACKSPACE: 8,
    TAB:       9,
    RETURN:   13,
    ESC:      27,
    SPACE:    32,
    PAGEUP:   33,
    PAGEDOWN: 34,
    CTRL:     17,
    SHIFT:    16,
    ALT:      18,
    END:      35,
    HOME:     36,
    LEFT:     37,
    UP:       38,
    RIGHT:    39,
    DOWN:     40,
    INSERT:   45,
    DELETE:   46,
    ZERO:     48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
    A:        65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
    TILDA:    192
  };
  var keys = Object.keys(KEY);
  for (var i = 0; i<keys.length; i++) {
    KEY[keys[i]] = [KEY[keys[i]],false];
  }
  
  document.addEventListener('keydown', (e) => {
    var keys = Object.keys(KEY);
    for (var i = 0; i<keys.length; i++) {
      if (KEY[keys[i]][0] === e.keyCode) {
        KEY[keys[i]][1] = true;
      }
    }
  }, false);
  document.addEventListener('keyup', (e) => {
    var keys = Object.keys(KEY);
    for (var i = 0; i<keys.length; i++) {
      if (KEY[keys[i]][0] === e.keyCode) {
        KEY[keys[i]][1] = false;
      }
    }
  }, false);
  var lmbDown = false;
  var rmbDown = false;
  var prevContextMenus = false;
  document.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      lmbDown = true;
    } else if (e.button === 2 && prevContextMenus) {
      e.preventDefault();
      rmbDown = true;
    }
  });
  document.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
      lmbDown = false;
    } else if (e.button === 2) {
      rmbDown = false;
    }
  });
  document.addEventListener("contextmenu", function(e) {
    if (prevContextMenus) {
      e.preventDefault();
    }
  });
  var yScroll = 0;
  var xScroll = 0;
  document.addEventListener("wheel", function(e) {
    yScroll = e.deltaY;
    xScroll = e.deltaX;
  });
  
  function RGBAToHex(r,g,b,a) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
    a = Math.round(a*255).toString(16);

    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
    if (a.length == 1)
      a = "0" + a;

    return "#" + r + g + b + a;
  }
}