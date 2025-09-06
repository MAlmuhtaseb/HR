import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Employee } from '../../interfaces/employee-interface';
import { ConfirmationDialog } from '../../shared-components/confirmation-dialog/confirmation-dialog';
import { EmployeesService } from '../../services/employees.service';
import { List } from '../../interfaces/list-interface';
import { DepartmentsService } from '../../services/departments.service';
import { LookupsService } from '../../services/lookups.service';
import { LookupsMajorCodes } from '../../enums/major-codes';
import { from } from 'rxjs';
@Component({
  selector: 'app-employees',
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule, ConfirmationDialog],
  providers: [DatePipe], // Depndency Injcution
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit  {

  @ViewChild ('closeButton') closeButton: ElementRef | undefined;// Get Element By ID
  @ViewChild ('empImageInput') empImageInput !: ElementRef;

  employees : Employee[] = [];

  employeesTableColumns: string[] = ["#","Image", "Name", "Phone", "Birthdate","Status", "Start Date", "Position", "Department", "Manager"];

  departments : List[]= [];

  positions : List[] = [];

  managers : List[] = [];
  
  employeeStatusList: List[] = [
    {id: null, name : "Select Status"},
    {id: true, name:"Active"},
    {id: false, name:"Inactive"},
  ]

  employeeForm : FormGroup = new FormGroup({
    Id: new FormControl(null),
    Name: new FormControl(null, [Validators.required]),
    Phone: new FormControl(null, [Validators.required]),
    Birthdate: new FormControl(null, [Validators.required]),
    StartDate: new FormControl(null, [Validators.required]),
    Department: new FormControl(null, [Validators.required]),
    Manager: new FormControl(null),
    Position: new FormControl(null, [Validators.required]),
    IsActive: new FormControl(true, [Validators.required]),
    Image: new FormControl(null),
    IsImage: new FormControl(false)
  });

  searchFilterForm: FormGroup = new FormGroup({
    Name: new FormControl(null),
    PositionId: new FormControl(null),
    Status: new FormControl(null)
  })

  paginationConfig = { itemsPerPage: 5, currentPage: 1};

  deleteDialogTitle : string = "Delete Confirmation";
  deleteDialogBody : string = "Are you sure you want to delete this employee?";
  showConfirmationDialog : boolean = false;
  employeeIdToBeDeleted : number | null = null;

  constructor(private _datePipe: DatePipe,
    private _employeeService : EmployeesService,
    private _departmentsService : DepartmentsService,
    private _lookupsService : LookupsService
  ){

  }

  ngOnInit(): void { // Life Cycle Hook
    this.loadEmployees();
    this.loadPositionsList();
  }
  
  ngOnDestroy(){
    console.log("Component Detroyed");
  }

  uploadImage(event : any){
    this.employeeForm.patchValue({
      Image: event.target.files[0]
    });
    
  }
  

  loadEmployees(){
    this.employees = [];

    let searchObj = {
      name: this.searchFilterForm.value.Name,
      positionId: this.searchFilterForm.value.PositionId,
      status: this.searchFilterForm.value.Status
    };

   this._employeeService.getAll(searchObj).subscribe(
    {
      next : (res : any) => { // Succesful Request
        if(res?.length > 0){
          
          res.forEach((x : any) => {
            let employee : Employee = {
              id: x.id,
              name: x.name,
              phone: x.phone,
              birthdate: x.birthDate,
              isActive: x.isActive,
              startDate: x.startDate,
              positionId: x.positionId,
              positionName: x.positionName,
              departmentId: x.departmentId,
              departmentName: x.departmentName,
              managerId: x.managerId,
              managerName: x.managerName,
              imagePath: x.imagePath ? x.imagePath.replaceAll("\\", "/") : "assets/images/emp-default-image.avif",
              isImage: x.imagePath ? true : false
            };
            this.employees.push(employee);
          });
        }
        else{
        }
      },
      error : err => { // Failed Request | 400, 500
        console.log(err.error.message ?? err.error ?? "Unexpected Error");
      }
    }
   );
  }

  loadManagersList(employeeId?:number){
    this.managers = [
      {id: null, name: "Select Manager"}
    ];

    this._employeeService.getManagers(employeeId).subscribe({
      next: (res : any) =>{
        if(res?.length > 0){
          res.forEach((x : any)=>{
            let manager : List = {id: x.id, name: x.name};
            this.managers.push(manager);
          })
        }
      },
      error : err => {
        console.log(err.error.message ?? err.error ?? "Unexpected Error");
      }
    })
  }

  loadDepartmentsList(){

    this.departments = [
      {id: null, name:"Select Department"}
    ];

    this._departmentsService.getDepartmentsList().subscribe({
      next: (res : any) => {
        if(res?.length > 0){
          this.departments = this.departments.concat(
            res.map((x : any) => ({id: x.id, name: x.name} as List))
          )
        }
      },
      error: err => {
        console.log(err.error.message ?? err.error ?? "Unexpected Error");
      }
    })
  }

  loadPositionsList(){
    this.positions = [
      {id: null, name: "Select Position"}
    ];

    this._lookupsService.getByMajorCode(LookupsMajorCodes.Positions).subscribe({
      next: (res : any) => {
        if(res?.length > 0){
          this.positions = this.positions.concat(
            res.map((x : any) => ({id: x.id, name: x.name} as List))
          )
        }
      },
      error: err => {
        console.log(err.error.message ?? err.error ?? "Unexpected Error");
      }
    })
  }




  saveEmployee(){
    let employeeId = this.employeeForm.value.Id ?? 0;
    let newEmp : Employee = {
      id: employeeId,
      name: this.employeeForm.value.Name,
      phone: this.employeeForm.value.Phone,
      birthdate: this.employeeForm.value.Birthdate,
      startDate: this.employeeForm.value.StartDate,
      isActive: this.employeeForm.value.IsActive,
      departmentId: this.employeeForm.value.Department,
      managerId: this.employeeForm.value.Manager,
      positionId: this.employeeForm.value.Position,
      image: this.employeeForm.value.Image,
      isImage: this.employeeForm.value.IsImage
    };

    if(!this.employeeForm.value.Id){// Add Employee
    this._employeeService.add(newEmp).subscribe({
      next: res =>{
        this.loadEmployees();
      },
      error: err =>{
        console.log(err.error.message ?? err.error ?? "Unexpected Error");
      }
    })
    }
    else{// Edit Employee


      this._employeeService.update(newEmp).subscribe({
      next: res =>{
        this.loadEmployees();
      },
      error: err =>{
        console.log(err.error.message ?? err.error ?? "Unexpected Error");
      }
    })
    }


    this.closeButton?.nativeElement.click();
    this.clearEmployeeForm();
  }

  clearInputImage(){
    this.empImageInput.nativeElement.value = ''; // Cleare Selected Image
  }

  clearEmployeeForm(){

    this.employeeForm.reset({
      IsActive: true,
      IsImage : false
    });

    this.clearInputImage();
  }
  


  editEmployee(id: number){
    this.loadSaveDialog(id);
    let employee = this.employees.find(x => x.id == id);

    if(employee != null){
      this.employeeForm.patchValue({
        Id: employee?.id,
        Name: employee?.name,
        Phone: employee?.phone,
        StartDate: this._datePipe.transform(employee?.startDate, 'yyyy-MM-dd'), // yyyy-mm-dd 2025-07-05
        Birthdate: this._datePipe.transform(employee?.birthdate, 'yyyy-MM-dd'),
        Department: employee?.departmentId,
        Manager: employee?.managerId,
        Position: employee?.positionId,
        IsActive: employee?.isActive,
        IsImage: employee?.isImage
      })
    }
  }


  removeEmployee(){
    if(this.employeeIdToBeDeleted){

      this._employeeService.delete(this.employeeIdToBeDeleted).subscribe({
        next: res => {
          this.loadEmployees();
        },
        error: err => {
          alert(err.error.message ?? err.error ?? "Unexpected Error");
        }
      });
    }
  }


  changePage(pageNumber : number){
    this.paginationConfig.currentPage = pageNumber;
  }


  showConfirmDialog(empId : number){
    this.employeeIdToBeDeleted = empId; // save employee id to be used later
    this.showConfirmationDialog = true; // show confirmation dialog
  }

  confrimEmployeeDelete(isConfirmed : boolean){
    if(isConfirmed){
      this.removeEmployee();
    }

    this.employeeIdToBeDeleted = null; // remove saved employee id
    this.showConfirmationDialog = false; // hide confirmation dialog
  }

  removeImage(){
    this.employeeForm.patchValue({
      IsImage : false
    })
  }

  loadSaveDialog(employeeId?: number){
    this.clearEmployeeForm();
    this.loadManagersList(employeeId);
    this.loadDepartmentsList();
    this.loadPositionsList();
  }

}

