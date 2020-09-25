import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { RichDateTime } from "./RichtDateTimeModel";

let dateModel: RichDateTime;

export function WorkItemFieldChanged(changedFields: { [key: string]: any; }) {
    let valuesList: Array<{ refName: string, value: string }> = new Array<{ refName: string, value: string }>();
    let newDateValue = changedFields[dateModel.DateValueRefName];
    if (newDateValue) {
        valuesList.push({ refName: dateModel.DateValueRefName, value: newDateValue })
    }
    let newMaxDateValue = changedFields[dateModel.DateMaxRefName];
    if (newMaxDateValue) {
        valuesList.push({ refName: dateModel.DateMaxRefName, value: newMaxDateValue })
    }
    let newMinDateValue = changedFields[dateModel.DateMinRefName];
    if (newMinDateValue) {
        valuesList.push({ refName: dateModel.DateMinRefName, value: newMinDateValue })
    }
    let newState = changedFields["System.State"];
    if (newState) {
        valuesList.push({ refName: "System.State", value: newState })
    }
    if (valuesList.length > 0) {
        dateModel.SetNewValues(valuesList);
        RefreshTheView();
    }
}

export function CreateView(model: RichDateTime) {
    dateModel = model;
    GetValues();
    $("#body").css("background-color", "inherit");
    $("#label").text(model.ControlName);
    $("#datepicker").change(() => OnFieldChanged());
}

function GetValues() {
    let fieldsRefNames: Array<string> = dateModel.GetFieldRefNames();
    fieldsRefNames.push("System.State");
    WorkItemFormService.getService().then(
        (service) => {
            service.getFieldValues(fieldsRefNames).then((inputsValues) => {
                dateModel.SetValues(inputsValues);
                RefreshTheView();
            })
        }
    );
}
function RefreshTheView() {
    if (dateModel.DateValue != undefined) {
        $("#datepicker").val((ConverToViewMode(dateModel.DateValue)));
        if (dateModel.CheckIfDellay()) {
            $("#datepicker").css("background-color", "lightpink");
        }
        else
            $("#datepicker").css("background-color", "inherit");
    }
    if (dateModel.MaxDate != undefined) {
        $("#datepicker").attr("max", ConverToViewMode(dateModel.MaxDate));
    }
    if (dateModel.MinDate != undefined) {
        $("#datepicker").attr("min", ConverToViewMode(dateModel.MinDate));
    }
}
function OnFieldChanged() {
    WorkItemFormService.getService().then(
        (service) => {
            service.setFieldValue(dateModel.DateValueRefName, GiveShortDate($("#datepicker").val()));
        }
    );
}
function GiveShortDate(dateToConvert: Date) {
    let x = dateToConvert.toString().split('-');
    let dateNew: string = x[2] + "/" + x[1] + "/" + x[0];//+ " 00:00"; 
    return dateNew;
}
function ConverToViewMode(date: Date) {
    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let today = date.getFullYear() + "-" + (month) + "-" + (day);
    return today;
}