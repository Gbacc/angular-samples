import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'my-quick-search',
    templateUrl: './quick-search.component.html',
    styleUrls: ['./quick-search.component.css']
})
export class QuickSearchComponent implements OnInit, OnDestroy {

    public quickSearchQueryString = new FormControl();
    public quickSearchResults: any = null;
    public quickSearchLoading: boolean = false;

    private _inputChangeSubscription: Subscription;
    private _inputMinCharacterLength: number = 3;

    constructor(
    ) { }

    public ngOnInit() {
        this.subscribeInputChange();
    }

    public ngOnDestroy() {
        this.unsubscribeInputChange();
    }

    private subscribeInputChange() {
        // We wait 700ms after the last value change , it means the user stopped typing
        this._inputChangeSubscription = this.quickSearchQueryString.valueChanges.debounceTime(700).subscribe(term => {

            // Clear the result list
            this.quickSearchResults = null;

            // Trigger the search if we have enough characters
            if (term.length >= this._inputMinCharacterLength) {

                // Search indicator
                this.quickSearchLoading = true;

                // Put as many service/api call as you need
                let observableQueue = [];
                observableQueue.push(Observable.of({ id: 1, label: 'someResult' }));
                observableQueue.push(Observable.of({ id: 19, label: 'someResultFromAnotherApi' }));

                Observable.forkJoin(observableQueue).subscribe(
                    completeResultList => {
                        for (let singleResultList of completeResultList) {
                            // Do whatever you want with your results
                            this.quickSearchResults.push(singleResultList);
                        }

                        // Search indicator
                        this.quickSearchLoading = false;
                    },
                    err => {
                        // Something went wront
                        console.log(err);
                        this.quickSearchResults = null;
                        this.quickSearchLoading = false;
                    }
                );
            }
        });
    }

    private unsubscribeInputChange() {
        // Clears the subscription
        this._inputChangeSubscription.unsubscribe();
    }
}
