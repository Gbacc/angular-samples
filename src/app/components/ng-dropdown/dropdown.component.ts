import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.css']
})

export class DropdownComponent {
    @Input() public items: Array<any>;
    @Input() public label: string;
    @Input() public icon: string;
    @Input() public selectedItem: any = null;
    @Output() public onSelectCallback: EventEmitter<any> = new EventEmitter();

    public ngOnChanges(changes: any) {
        // Detect binding change
        if (changes.selectedItem && changes.selectedItem.currentValue) {
            this.label = changes.selectedItem.currentValue.label;
            if (changes.selectedItem.currentValue.icon) {
                this.icon = changes.selectedItem.currentValue.icon;
            }
        }
    }

    public onItemSelectEmit(event) {
        this.selectedItem = event;

        // Set the selected label and icon
        this.label = event.label;
        if (event.icon) {
            this.icon = event.icon;
        }

        // Send the selected element to the callback function
        this.onSelectCallback.emit(event);
    }
}
