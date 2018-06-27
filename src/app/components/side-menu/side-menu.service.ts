import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class SideMenuService {

    private _formStatusObservable: Observable<any> = new Observable();
    public formStatus: string = null;

    private _menuActionListObservable = new BehaviorSubject([]);
    private _menuActionListObservableSub: Subscription;
    public menuActionList: Array<any> = [];

    constructor(
        public router: Router,
    ) {
        // Action list
        this._menuActionListObservable.subscribe((list) => {
            this.menuActionList = list;
        });

        // Route change makes component reset
        this.router.events.subscribe((res) => {
            if (res instanceof NavigationStart) {
                this._menuActionListObservable.next([]);

                if (this._menuActionListObservableSub) {
                    this._menuActionListObservableSub.unsubscribe();
                    this.formStatus = null;
                }
            }
        });
    }

    public setMenuActionList(menuActionList: Array<any>): void {
        // This observable will handle the component action list
        this._menuActionListObservable.next(menuActionList);
    }

    public setFormStatusObservable(observable: Observable<any>): void {
        // This observable will handle the component status (change, pending, failed, etc)
        this._formStatusObservable = observable;

        this._menuActionListObservableSub = this._formStatusObservable.subscribe((status) => {
            this.formStatus = status;
        });
    }
}
