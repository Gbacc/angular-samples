import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'dropdown-item',
    templateUrl: './dropdown-item.component.html',
    styleUrls: ['./dropdown-item.component.css']
})

export class DropdownItemComponent {
    @Input() public items: Array<any>;
    @Input() public selectedItem: any;
    @Output() public onItemSelect: EventEmitter<any> = new EventEmitter();

    public onItemSelectEmit(event) {
        // Send event to the parent component
        this.onItemSelect.emit(event);
    }

    public getIcon(item) {
        if (item.icon) {
            return item.icon;
        } else {
            return '&nbsp;';
        }
    }
}
