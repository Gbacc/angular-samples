import { Component } from '@angular/core';
import { SideMenuService } from './side-menu.service';

@Component({
    selector: 'side-menu',
    templateUrl: './side-menu.component.html',
    styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent {

    constructor(
        public sideMenuService: SideMenuService,
    ) { }

    public launchAction(action: any) {
        // Handle the callback defined with each action either an observable or a simple function
        if (action['type'] === 'observable') {
            action.status = 'pending';

            action.action().subscribe(
                (result) => {
                    // SUCCESS ! Then reset the state 3000ms after showing up
                    action.status = 'success';
                    setTimeout(function () {
                        delete action.status;
                    }, 3000);
                }, (error) => {
                    action.status = 'failed';
                }
            );

        } else {
            action.action();
        }
    }
}
