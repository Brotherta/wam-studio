<h1>Better styling tool for faust generated plugins</h1>

```js
window.instance.gui.__proto__.cleanup = function (ignore) {
  var grid = document.createElement("div");
  grid.id = "grid";
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(3, 1fr)";
  grid.style.gridTemplateRows = "repeat(3, 1fr)";

  this.cleanUpChilds = [grid];

  var elements = this._root.querySelectorAll(".drag");
  elements.forEach((el, index) => {
    el.style.top = "";
    el.style.bottom = "";
    el.style.left = "";
    el.style.right = "";
    el.style.height = "";
    el.style.width = "";
    el.style.position = "static";
    el.style.transform = "";
    el.style.alignSelf = "center";
    el.style.justifySelf = "center";

    if (el.style.display != "none") {
      if (!ignore.includes(index)) {
        grid.appendChild(el);
      } else {
        this.cleanUpChilds.push(el);
      }
    }
  });

  var pedal = this._root.querySelector(".my-pedal");
  pedal.style.display = "grid";
  pedal.style.borderStyle = "solid";
  pedal.style.gridTemplateRows = `repeat(${ignore.length + 1}, 1fr)`;
  pedal.style.border = "none";

  pedal.appendChild(grid);

  console.log(this.cleanUpChilds);
};
window.instance.gui.__proto__.reOrder = function (order) {
  this._root.querySelector(".my-pedal").innerHTML = "";
  order.forEach((i) => {
    this._root.querySelector(".my-pedal").appendChild(this.cleanUpChilds[i]);
  });
};
window.instance.gui.__proto__.reOrderGrid = function (order) {
  var childs = [];
  var grid = this._root.getElementById("grid");
  grid.childNodes.forEach((el) => {
    childs.push(el);
  });
  grid.innerHTML = "";

  order.forEach((i) => {
    grid.appendChild(childs[i]);
  });
};
window.instance.gui.__proto__.toHTML = function () {
  var html = this._root.innerHTML
    .split("<!-- Code injected by live-server -->")[0]
    .split(this.basePath)
    .join("");
  console.log(html);
};
```

1. Run host.js with liveServer
2. Then paste this code in the console
3. Then from the console run

```js
window.instance.gui.cleanup([0, 7]);
```

    The list includes the indexes of the HTMLElements you don't want to include in a grid, in my case the Title DISTORDER and the on/off switch respectively with the indexes 0 and 7.

![Default faust generated wap](https://cdn.discordapp.com/attachments/324198067089702913/971823709977456662/default.png)

    Now my wap looks like this.

![Wap after cleanup](https://cdn.discordapp.com/attachments/324198067089702913/971825415545040927/step1.png)

4. Then run

```js
window.instance.gui.reOrder([2, 0, 1]);
```

    I want to change the order of my HTMLElements so the list I pass as a parameter is the order i want.

![Wap after reOrder](https://cdn.discordapp.com/attachments/324198067089702913/971826303676342372/step2.png)

5. Then run

```js
window.instance.gui.reOrderGrid([0, 1, 2, 6, 7, 8, 3, 4, 5, 9, 10, 11]);
```

    My knobs and labels are in a grid but the order is not the one i would like so like the previous steps i just need to change it.

![Wap after reOrderGrid](https://cdn.discordapp.com/attachments/324198067089702913/971827112090693712/step3.png)

6. Then run and copy the result

```js
window.instance.gui.toHTML();
```

In Gui.js replace

```js
this._root.innerHTML = ...;
```

by

```js
this.style.display = "inline-flex";
this._root.innerHTML = clipboard content;
```

    It may not work for every plugin but it's better than what faust is offering with it's relative position for every components.
