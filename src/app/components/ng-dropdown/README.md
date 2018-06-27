# About this component
This component is a simplement html dropdown component usable with Angular 2+.  
It is based on [Spectre.css](https://picturepan2.github.io/spectre/) library using the [dropdown menu](https://picturepan2.github.io/spectre/components.html#menu-dropdown) component and [Fontawesome](https://fontawesome.com/v4.7.0/).

# Usage
The html template looks as follow
```
<dropdown [label]="'My awesome dropdown menu'" [icon]="someHtmlMarkupIcon" [items]="myItemListArray" (onSelectCallback)="woopsAnElementHasBeenSelected($event)"></dropdown>
```

The `items` array should be something like this
```json
[
    {
        id: 1,
        label: 'some label',
        icon: '<i class="some font class"/>',
        children: [{...},{...}]
    }
]
```