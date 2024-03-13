import { Component, ContentChildren, QueryList, AfterContentChecked, EventEmitter, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements AfterContentChecked {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;
  @Output() tabCloseAction = new EventEmitter<TabComponent>();

  private _tabActiveByDefault: BehaviorSubject<boolean> = new BehaviorSubject(false);

  ngAfterContentChecked(): void {
    if (!this._tabActiveByDefault.value && this.tabs.length > 0) {
      const activeTab = this.tabs.filter(tab => tab.isActive);
      if (activeTab.length === 0) {
        // Promise.resolve to avoid ExpressionChangedAfterItHasBeenCheckedError
        Promise.resolve().then(() => {
          this.selectTab(this.tabs.first);
          this._tabActiveByDefault.next(true);
        });
      }
    }
  }

  selectTab(tab: TabComponent): void {
    this.tabs.toArray().forEach(tab => tab.isActive = false);
    tab.isActive = true;
  }

  closeTab(tab: TabComponent): void {
    const index = this.tabs.toArray().indexOf(tab);
    const tabsArray = this.tabs.toArray();
    tabsArray.splice(index, 1);
    this.tabCloseAction.emit(tab);
    this.tabs.reset(tabsArray);
    if (this.tabs.length > 0) {
      this.selectTab(this.tabs.first);
    } else {
      this._tabActiveByDefault.next(false);
    }
  }
}