<%-_
const caption = await tp.system.prompt("Caption for image");
-%>
![<%_ tR += caption %>](../images/insert-filename-here.png)
<span class="caption"><%\* tR += caption %></span>
