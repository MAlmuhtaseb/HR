import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Department } from '../../interfaces/department-interface';
import { NgxPaginationModule } from 'ngx-pagination';
import { DepartmentsService } from '../../services/departments.service';
import { List } from '../../interfaces/list-interface';
import { LookupsService } from '../../services/lookups.service';
import { LookupsMajorCodes } from '../../enums/major-codes';
import { ConfirmationDialog } from '../../shared-components/confirmation-dialog/confirmation-dialog';
@Component({
  selector: 'app-departments',
  imports: [ReactiveFormsModule, NgxPaginationModule, ConfirmationDialog],
  templateUrl: './departments.html',
  styleUrl: './departments.css'
})
export class Departments {
  @ViewChild ('closeButton') closeButton: ElementRef | undefined;// Get Element By ID

  departmentsTableColumns: string[] = ["#", "Name", "Floor Number", "Type", "Description"];

  departments : Department[] = [];

  paginationConfig = { itemsPerPage: 5, currentPage: 1};

  addButtonDisabled: boolean = false;

  departmentTypes : List[] = [];

  showConfirmationDialog : boolean = false;

  deleteDialogTitle: string = "Delete Confirmation";
  deleteDialogBody:string = "Are you sure you want to delete this department?";
  departmentIdToBeDeleted : number | null = null;
  searchFilterForm: FormGroup = new FormGroup({
    Name: new FormControl(null),
    FloorNumber: new FormControl(null),
  });


  departmentForm: FormGroup = new FormGroup({
    Id: new FormControl(null),
    Name: new FormControl(null, [Validators.required]),
    FloorNumber: new FormControl(null),
    Description: new FormControl(null),
    TypeId : new FormControl(null, [Validators.required])
  })

  constructor(private _departmentsService : DepartmentsService,
    private _lookupsService : LookupsService
  ){

  }

  ngOnInit(){
    this.loadDepartments();
    this.checkRole()
  }
  
  loadDepartments(){
    this.departments = [];
    let searchObj = {
      departmentName : this.searchFilterForm.value.Name,
      floorNumber : this.searchFilterForm.value.FloorNumber
    }

    this._departmentsService.getAll(searchObj).subscribe({
      next: (res : any) => {
        if(res?.length > 0){
                  
                  res.forEach((x : any) => {
                    let department : Department = {
                      id: x.id,
                      name: x.name,
                      floorNumber: x.floorNumber,
                      typeId: x.typeId,
                      typeName: x.typeName,
                      description: x.description
                    };
                    this.departments.push(department);
                  });
                }
      },
      error : err => {
        console.log(err.error.message ?? err.error ?? "Unexpected Error");
      }
    })
  }

  loadSaveDialog(){
    this.clearDepartmentForm();
    this.loadDepartmentTypes();
  }

  showConfirmDialog(id : number){
    this.departmentIdToBeDeleted = id; // save department id to be used later
    this.showConfirmationDialog = true; // show confirmation dialog 
  }

  editDepartment(id : number){
    this.loadSaveDialog();
    let department = this.departments.find(x => x.id == id);

    if(department != null){
      this.departmentForm.patchValue({
        Id: department?.id,
        Name: department?.name,
        FloorNumber: department?.floorNumber,
        TypeId: department?.typeId,
        Description: department?.description,
        
      })
    }
  }

  changePage(pageNumber : number){
    this.paginationConfig.currentPage = pageNumber;
  }

  clearDepartmentForm(){
    this.departmentForm.reset();
  }

  loadDepartmentTypes(){
        this.departmentTypes = [
          {id: null, name: "Select Type"}
        ];
    
        this._lookupsService.getByMajorCode(LookupsMajorCodes.DepartmentTypes).subscribe({
          next: (res : any) => {
            if(res?.length > 0){
              this.departmentTypes = this.departmentTypes.concat(
                res.map((x : any) => ({id: x.id, name: x.name} as List))
              )
            }
          },
          error: err => {
            console.log(err.error.message ?? err.error ?? "Unexpected Error");
          }
        })
  }

  saveDepartment(){
        let departmentId = this.departmentForm.value.Id ?? 0;
        let newDep : Department = {
          id: departmentId,
          name: this.departmentForm.value.Name,
          floorNumber: this.departmentForm.value.FloorNumber,
          typeId: this.departmentForm.value.TypeId,
          description: this.departmentForm.value.Description,
        };
    
        if(!this.departmentForm.value.Id){// Add Department
        this._departmentsService.add(newDep).subscribe({
          next: res =>{
            this.loadDepartments();
          },
          error: err =>{
            console.log(err.error.message ?? err.error ?? "Unexpected Error");
          }
        })
        }
        else{// Edit Department
    
    
          this._departmentsService.update(newDep).subscribe({
          next: res =>{
            this.loadDepartments();
          },
          error: err =>{
            console.log(err.error.message ?? err.error ?? "Unexpected Error");
          }
        })
        }
    
    
        this.closeButton?.nativeElement.click();
        this.clearDepartmentForm();
  }

  confrimDepartmentDelete(isConfirmed : boolean){
    if(isConfirmed){
      this.removeDepartment();
    }

    this.departmentIdToBeDeleted = null; // remove saved department id
    this.showConfirmationDialog = false; // hide confirmation dialog
  }

  removeDepartment(){
    if(this.departmentIdToBeDeleted){

      this._departmentsService.delete(this.departmentIdToBeDeleted).subscribe({
        next: res => {
          this.loadDepartments();
        },
        error: err => {
          alert(err.error.message ?? err.error ?? "Unexpected Error");
        }
      });
    }
  }

   checkRole(){

    let role = localStorage.getItem("role");

    if(role?.toUpperCase() != "ADMIN" && role?.toUpperCase() != "HR"){
      this.addButtonDisabled = true;
    }
  }
}
