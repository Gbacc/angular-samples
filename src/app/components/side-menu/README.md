# About this component
This component is a customizable side-menu component usable with Angular 2+.  
It is based on [Spectre.css](https://picturepan2.github.io/spectre/) library and [Fontawesome](https://fontawesome.com/v4.7.0/).  

It works in 2 ways :
* Shows up a global state of the component with label/color : Changes not saved, Saving..., Save complete, Error occured
* Shows up a list of buttons defined by the user. Can be bound to a label/icon/function and reflects the function async state if possible

# Usage

## Service
You need the service to use anything
```typescript
// Use the service to bind what you need
import { SideMenuService } from './side-menu.service';
constructor(private _sideMenuService: SideMenuService) {}
```

## Global state
Show up a global state of the component using a single or multiple observable

Possible state : 
* pending = Changes not saved
* success = Saving...
* failed = Error occured
* changed = Save complete

```typescript
public applicationFormHasChanged = new BehaviorSubject(null);

public myFunction() {
    // Define an observable wich will change de state of the component and display a corresponding label
    this._sideMenuService.setFormStatusObservable(this.applicationFormHasChanged);
    // And you can then change it on the fly
    this.applicationFormHasChanged.next('pending');
    this.applicationFormHasChanged.next('success');
    this.applicationFormHasChanged.next('failed');
    this.applicationFormHasChanged.next('changed');
}
```

## User defined action list
You can define a custom list of actions wich will be converted to buttons.
The action can be an observable so the button will reflect its async state (pending, success, failed)

```typescript
public myFunction() {
    // Define a list a action bound to the component
    let saveButton = {
        label: 'Save', 
        // The action bound to the button
        action: this.saveUser.bind(this), 
        // Here we use fontawesome fonts
        icon: 'fa-floppy-o', 
        // If we have an observable, put the type here so the component will handle its async status
        type: 'observable',
        // If enabled/disabled state is needed, a function can be bound to define the case when the button is enabled
        actionEnabled: this.formCanBeSubmitted.bind(this)
    };
    this._sideMenuService.setMenuActionList([saveButton]);
}

```