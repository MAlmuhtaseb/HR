import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../interfaces/employee-interface';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  
  apiUrl : string = "https://localhost:44324/api/Employees";
  constructor(private _http : HttpClient){

  }

  getAll(searchObj: any){

    let params = new HttpParams();
    params = params.set("PositionId", searchObj.positionId ?? "");
    params = params.set("EmployeeName", searchObj.name ?? "");
    params = params.set("IsActive", searchObj.status ?? "");

    return this._http.get(this.apiUrl + "/GetAll", {params});
  }

  getManagers(employeeId?: number){
    let params = new HttpParams();
    params = params.set("employeeId", employeeId ?? ""); // employeeId != null? employeeId : ""
    return this._http.get(this.apiUrl + "/GetManagersList", {params});
  }

  add(employee : Employee){
    let formData = new FormData();
    formData.set("Id", employee.id.toString());
    formData.set("Name", employee.name);
    formData.set("Birthdate", employee.birthdate?.toString() ?? "");
    formData.set("Phone", employee.phone ?? "");
    formData.set("PositionId", employee.positionId?.toString() ?? "");
    formData.set("IsActive", employee.isActive?.toString() ?? "");
    formData.set("StartDate", employee.startDate?.toString() ?? "");
    formData.set("DepartmentId", employee.departmentId?.toString() ?? "");
    formData.set("ManagerId", employee.managerId?.toString() ?? "");
    formData.set("Image", employee.image ?? "");

    return this._http.post(this.apiUrl + "/Add", formData);
  }

  update(employee : Employee){
    let formData = new FormData();
    formData.set("Id", employee.id.toString());
    formData.set("Name", employee.name);
    formData.set("Birthdate", employee.birthdate?.toString() ?? "");
    formData.set("Phone", employee.phone ?? "");
    formData.set("PositionId", employee.positionId?.toString() ?? "");
    formData.set("IsActive", employee.isActive?.toString() ?? "");
    formData.set("StartDate", employee.startDate?.toString() ?? "");
    formData.set("DepartmentId", employee.departmentId?.toString() ?? "");
    formData.set("ManagerId", employee.managerId?.toString() ?? "");
    formData.set("Image", employee.image ?? "");
    formData.set("IsImage", employee.isImage?.toString() ?? "false");
    return this._http.put(this.apiUrl + "/Update", formData);
  }

  delete(id : number){
    let params = new HttpParams();
    params = params.set("id", id);
    return this._http.delete(this.apiUrl + "/Delete", {params});
  }

}
