import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Department } from '../../interfaces/department-interface';
import { NgxPaginationModule } from 'ngx-pagination';
import { VacationsService } from '../../services/vacations.service';
import { EmployeesService } from '../../services/employees.service';
import { List } from '../../interfaces/list-interface';
import { LookupsService } from '../../services/lookups.service';
import { LookupsMajorCodes } from '../../enums/major-codes';
import { ConfirmationDialog } from '../../shared-components/confirmation-dialog/confirmation-dialog';
import { Vacation } from '../../interfaces/vacation-interface';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-vacations',
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, ConfirmationDialog],
  providers: [DatePipe],
  templateUrl: './vacations.html',
  styleUrl: './vacations.css'
})
export class Vacations {
  @ViewChild ('closeButton') closeButton: ElementRef | undefined;// Get Element By ID

  vacationsTableColumns: string[] = ["#", "Employee Name", "Start Date", "End Date", "Type","Creation Date", "Notes"];

  vacations : Vacation[] = [];

  paginationConfig = { itemsPerPage: 5, currentPage: 1};

  addButtonDisabled: boolean = false;

  vacationTypesList : List[] = [];
  employeesList : List[] = [];

  showConfirmationDialog : boolean = false;

  deleteDialogTitle: string = "Delete Confirmation";
  deleteDialogBody:string = "Are you sure you want to delete this vacation?";
  vacationIdToBeDeleted : number | null = null;

  searchFilterForm: FormGroup = new FormGroup({
    TypeId: new FormControl(null),
    EmployeeId: new FormControl(null),
  });


  vacationForm: FormGroup = new FormGroup({
    Id: new FormControl(null),
    StartDate: new FormControl(null, [Validators.required]),
    EndDate: new FormControl(null, [Validators.required]),
    EmployeeId: new FormControl(null, [Validators.required]),
    TypeId : new FormControl(null, [Validators.required]),
    Notes : new FormControl(null)
  })

  constructor(private _vacationsService : VacationsService,
    private _employeesService: EmployeesService,
    private _lookupsService : LookupsService,
    private _datePipe: DatePipe
  ){

  }

  ngOnInit(){
    this.loadVacations();
    this.loadEmployeesList();
    this.loadVacationTypes();
  }
  
  loadVacations(){
    this.vacations = [];
    let searchObj = {
     vacationTypeId: this.searchFilterForm.value.TypeId,
      employeeId : this.searchFilterForm.value.EmployeeId
    }

    this._vacationsService.getAll(searchObj).subscribe({
      next: (res : any) => {
        if(res?.length > 0){
                  
                  res.forEach((x : any) => {
                    let vacation : Vacation = {
                      id: x.id,
                      startDate: x.startDate,
                      endDate: x.endDate,
                      creationDate: x.creationDate,
                      typeId: x.typeId,
                      typeName: x.typeName,
                      employeeId: x.employeeId,
                      employeeName: x.employeeName,
                      notes: x.notes,
                    };
                    this.vacations.push(vacation);
                  });
                }
      },
      error : err => {
        console.log(err.error.message ?? err.error ?? "Unexpected Error");
      }
    })
  }

  loadSaveDialog(){
    this.clearVacationForm();
    this.loadVacationTypes();
    this.loadEmployeesList();
  }

  showConfirmDialog(id : number){
    this.vacationIdToBeDeleted = id; // save department id to be used later
    this.showConfirmationDialog = true; // show confirmation dialog 
  }

  editVacation(id : number){
    this.loadSaveDialog();
    let vacation = this.vacations.find(x => x.id == id);

    if(vacation != null){
      this.vacationForm.patchValue({
        Id: vacation?.id,
        EmployeeId: vacation?.employeeId,
        TypeId: vacation?.typeId,
        StartDate: this._datePipe.transform(vacation?.startDate, 'yyyy-MM-dd') , 
        EndDate: this._datePipe.transform( vacation?.endDate, 'yyyy-MM-dd'),
        Notes: vacation?.notes,
        
      })
    }
  }

  changePage(pageNumber : number){
    this.paginationConfig.currentPage = pageNumber;
  }

  clearVacationForm(){
    this.vacationForm.reset();
  }

  loadVacationTypes(){
        this.vacationTypesList = [
          {id: null, name: "Select Type"}
        ];
    
        this._lookupsService.getByMajorCode(LookupsMajorCodes.VacationTypes).subscribe({
          next: (res : any) => {
            if(res?.length > 0){
              this.vacationTypesList = this.vacationTypesList.concat(
                res.map((x : any) => ({id: x.id, name: x.name} as List))
              )
            }
          },
          error: err => {
            console.log(err.error.message ?? err.error ?? "Unexpected Error");
          }
        })
  }

    loadEmployeesList(){
        this.employeesList = [
          {id: null, name: "Select Employee"}
        ];
    
        let role = localStorage.getItem("role");
        let currentUserOnly = false;
        if(role?.toUpperCase() != "ADMIN" && role?.toUpperCase() != "HR"){
            currentUserOnly = true;
        }
        this._employeesService.getEmployeesList(currentUserOnly).subscribe({
          next: (res : any) => {
            if(res?.length > 0){
              this.employeesList = this.employeesList.concat(
                res.map((x : any) => ({id: x.id, name: x.name} as List))
              )
            }
          },
          error: err => {
            console.log(err.error.message ?? err.error ?? "Unexpected Error");
          }
        })
  }

  saveVacation(){
        let vacationtId = this.vacationForm.value.Id ?? 0;
        let newVac : Vacation = {
          id: vacationtId,
          startDate: this.vacationForm.value.StartDate,
          endDate: this.vacationForm.value.EndDate,
          typeId: this.vacationForm.value.TypeId,
          employeeId: this.vacationForm.value.EmployeeId,
          notes: this.vacationForm.value.Notes,
        };
    
        if(!this.vacationForm.value.Id){// Add Vacation
        this._vacationsService.add(newVac).subscribe({
          next: res =>{
            this.loadVacations();
          },
          error: err =>{
            console.log(err.error.message ?? err.error ?? "Unexpected Error");
          }
        })
        }
        else{// Edit Vacation
    
    
          this._vacationsService.update(newVac).subscribe({
          next: res =>{
            this.loadVacations();
          },
          error: err =>{
            console.log(err.error.message ?? err.error ?? "Unexpected Error");
          }
        })
        }
    
    
        this.closeButton?.nativeElement.click();
        this.clearVacationForm();
  }

  confrimVacationDelete(isConfirmed : boolean){
    if(isConfirmed){
      this.removeVacation();
    }

    this.vacationIdToBeDeleted = null; // remove saved department id
    this.showConfirmationDialog = false; // hide confirmation dialog
  }

  removeVacation(){
    if(this.vacationIdToBeDeleted){

      this._vacationsService.delete(this.vacationIdToBeDeleted).subscribe({
        next: res => {
          this.loadVacations();
        },
        error: err => {
          alert(err.error.message ?? err.error ?? "Unexpected Error");
        }
      });
    }
  }

  //  checkRole(){

  //   let role = localStorage.getItem("role");

  //   if(role?.toUpperCase() != "ADMIN" && role?.toUpperCase() != "HR"){
  //     this.addButtonDisabled = true;
  //   }
  // }

}
