"use client";

import React from "react";
import { Modal, Form, Input, DatePicker, TimePicker, InputNumber, Checkbox, Select, message } from "antd"; //Modal = popup window; selct  dropdown menu
import { useApi } from "@/hooks/useApi";
import moment from "moment"; //handle time

const { TextArea } = Input;
const { Option } = Select;

interface CreateActivityModalProps {
  visible: boolean;
  onClose: () => void; // as it returns nothing when closed 
  groupId: string;
  onSuccess: () => void; // refreshes the data so that the new activity pops up right after 
}

const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ visible, onClose, groupId, onSuccess }) => {
  const [form] = Form.useForm();
  const apiService = useApi();
  const [messageApi, contextHolder] = message.useMessage();

  // when pop up is successfully completed, this gets sent 
  const onFinish = async (values: any) => {
    try {
      // all the data that is then organizedly sent to backend      
      const payload = {
        name: values.title,
        description: values.description, 
        minSize: values.minParticipants,
        maxSize: values.maxParticipants,
        isRecursive: values.isRecursive || false,
        isWeatherDependent: values.isWeatherDependent || false,
        timePreference: {
          startDate: values.startDate ? values.startDate.format("YYYY-MM-DD") : null,
          endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
          startTime: values.timeRange ? values.timeRange[0].format("HH:mm") : null,
          endTime: values.timeRange ? values.timeRange[1].format("HH:mm") : null,
        },
        // this is only sent if the activity depends on the event 
        ...(values.isWeatherDependent && {
          weatherRequirement: {
            minTemp: values.minTemp,
            maxTemp: values.maxTemp,
            rainPreference: values.rainPreference,
          }
        })
      };

      //REST call based on the REST specifications
      await apiService.post(`/groups/${groupId}/activities`, payload);
      
      messageApi.success("Activity proposed successfully!");
      form.resetFields();
      onSuccess(); // refresh
      onClose(); // close popup 
    } catch (error) {
      console.error("Failed to create activity:", error);
      messageApi.error("Failed to create activity. Please try again.");
    }
  };

  