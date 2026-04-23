"use client";

import React from "react";
import { Modal, Form, Input, TimePicker, InputNumber, Checkbox, Select, message } from "antd"; //Modal = popup window; selct  dropdown menu
import { useApi } from "@/hooks/useApi";
import moment from "moment"; //handle time

const { TextArea } = Input;
const { Option } = Select;

interface ActivityFormValues {
  title: string;
  description: string;
  minParticipants: number;
  maxParticipants: number;
  isRecursive: boolean;
  isWeatherDependent: boolean;
  duration: number;
  timeRange?: [moment.Moment, moment.Moment];
  minTemp?: number;
  maxTemp?: number;
  rainPreference?: string;
}

interface CreateActivityModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  userId: string;
  onSuccess: () => void;
}



const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ visible, onClose, groupId, userId, onSuccess }) => {
  const [form] = Form.useForm();
  const apiService = useApi();
  const [messageApi, contextHolder] = message.useMessage();

  // when pop up is successfully completed, this gets sent 
  const onFinish = async (values: ActivityFormValues) => {
    try {
      // all the data that is then organizedly sent to backend      
    const payload = {
      name: values.title,
      description: values.description,
      minSize: values.minParticipants,
      maxSize: values.maxParticipants,
      duration: values.duration, 
      isRecursive: values.isRecursive || false,
      isWeatherDependent: values.isWeatherDependent || false,
      startTime: values.timeRange ? values.timeRange[0].format("HH:mm:ss") : null,
      endTime: values.timeRange ? values.timeRange[1].format("HH:mm:ss") : null,
      createdBy: Number(userId),


      ...(values.isWeatherDependent && {
        minTemp: values.minTemp,
        maxTemp: values.maxTemp,
        rainPreference: values.rainPreference,
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


  const inputStyle = { // for where the user writtes the info
    backgroundColor: "#f0f0f0", // Light grey
    color: "#000000",           // Black text
    borderColor: "#d9d9d9"      // Standard Ant Design border
  };
  
  // Black labels
  const labelStyle = { 
    color: "#000000", 
    fontWeight: 600, //boldness
    fontSize: "13px" 
  };

  return (
    <>
      {contextHolder}
      <Modal // starting of the modal window 
        title={<span style={{ color: "black", fontSize: "22px", fontWeight: "bold" }}>New Activity</span>}
        open={visible} //controlls when it pops up
        onCancel={onClose} //function from parent 
        onOk={() => form.submit()}// when submitt button is pressed onFinish
        okText="Create"
        cancelText="Cancel"
        // Style the buttons to match the clean look
        okButtonProps={{ style: { backgroundColor: "black", color: "white", fontWeight: "bold", borderRadius: "6px" } }}
        cancelButtonProps={{ style: { color: "black", borderColor: "#d9d9d9", borderRadius: "6px" } }}
        styles={{
          body: { backgroundColor: "#ffffff", borderRadius: "12px" }, // Clean white background
          header: { backgroundColor: "#ffffff", borderBottom: "none", paddingBottom: "10px" }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ isRecursive: false, isWeatherDependent: false }}
        >
          <Form.Item
            name="title"
            label={<span style={labelStyle}>TITLE</span>}
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="e.g. Mountain Hiking" style={inputStyle} />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span style={labelStyle}>DESCRIPTION</span>}
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <TextArea rows={3} placeholder="What are we doing?" style={inputStyle} />
          </Form.Item>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="duration"
              label={<span style={labelStyle}>DURATION (hours)</span>}
              rules={[{ required: true, message: "Required" }]}
              style={{ flex: 1 }}
            >
               <InputNumber min={1} max={24} style={{ width: "100%", ...inputStyle }} />
            </Form.Item>
            <Form.Item
              name="timeRange"
              label={<span style={labelStyle}>TIME WINDOW</span>}
              rules={[{ required: true, message: "Required" }]}
              style={{ flex: 1 }}
            >
              <TimePicker.RangePicker format="HH:mm" style={{ width: "100%", ...inputStyle }} />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="minParticipants"
              label={<span style={labelStyle}>MIN PARTICIPANTS</span>}
              rules={[{ required: true, message: "Required" }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={1} style={{ width: "100%", ...inputStyle }} />
            </Form.Item>
            
            <Form.Item
              name="maxParticipants"
              label={<span style={labelStyle}>MAX PARTICIPANTS</span>}
              dependencies={['minParticipants']}
              rules={[
                { required: true, message: "Required" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('minParticipants') <= value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Max must be greater or equal to Min'));
                  },
                }),
              ]}
              style={{ flex: 1 }}
            >
              <InputNumber min={1} style={{ width: "100%", ...inputStyle }} />
            </Form.Item>
          </div>

          <Form.Item name="isRecursive" valuePropName="checked">
            <Checkbox style={{ color: "black", fontWeight: 500 }}>Make this a recurring activity</Checkbox>
          </Form.Item>

          <Form.Item name="isWeatherDependent" valuePropName="checked">
            <Checkbox style={{ color: "black", fontWeight: 500 }}>Weather dependent activity</Checkbox>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.isWeatherDependent !== currentValues.isWeatherDependent}
          >
            {({ getFieldValue }) =>
              getFieldValue('isWeatherDependent') ? (
                <div style={{ backgroundColor: "#fafafa", padding: "16px", borderRadius: "8px", marginTop: "16px", border: "1px solid #e8e8e8" }}>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <Form.Item
                      name="minTemp"
                      label={<span style={labelStyle}>MIN TEMPERATURE (°C)</span>}
                      rules={[{ required: true, message: "Required" }]}
                      style={{ flex: 1 }}
                    >
                      <InputNumber style={{ width: "100%", ...inputStyle }} />
                    </Form.Item>
                    
                    <Form.Item
                      name="maxTemp"
                      label={<span style={labelStyle}>MAX TEMPERATURE (°C)</span>}
                      dependencies={['minTemp']}
                      rules={[
                        { required: true, message: "Required" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value === undefined || getFieldValue('minTemp') === undefined || getFieldValue('minTemp') <= value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Max temp must be higher than Min'));
                          },
                        }),
                      ]}
                      style={{ flex: 1 }}
                    >
                      <InputNumber style={{ width: "100%", ...inputStyle }} />
                    </Form.Item>
                  </div>
                  
                  <Form.Item
                    name="rainPreference"
                    label={<span style={labelStyle}>RAIN PREFERENCE</span>}
                    rules={[{ required: true, message: "Select a preference" }]}
                  >
                    <Select placeholder="Select..." style={{ width: "100%" }}>
                      <Option value="SHOULD_RAIN">Should Rain</Option>
                      <Option value="NO_RAIN">No Rain</Option>
                      <Option value="ANY">Any</Option>
                    </Select>
                  </Form.Item>
                </div>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateActivityModal;




  