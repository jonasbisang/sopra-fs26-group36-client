"use client";

import React from "react";
import { Modal, Form, Input, TimePicker, InputNumber, Checkbox, Select, message, ConfigProvider } from "antd";
import { useApi } from "@/hooks/useApi";
import moment from "moment";

const { Option } = Select;

interface ActivityFormValues {
  title: string;
  location: string;
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
  memberCount: number;
}

const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ visible, onClose, groupId, userId, onSuccess, memberCount }) => {
  const [form] = Form.useForm();
  const apiService = useApi();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: ActivityFormValues) => {
    if (values.timeRange && values.timeRange[0] && values.timeRange[1]) {
      const windowHours = (values.timeRange[1].valueOf() - values.timeRange[0].valueOf()) / (1000 * 60 * 60);

      if (values.duration > windowHours) {
        const totalMinutes = Math.round(windowHours * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        const display = hours === 0
          ? `${minutes}min`
          : minutes === 0
          ? `${hours}h`
          : `${hours}h ${minutes}min`;

        messageApi.error(`Duration (${values.duration}h) cannot exceed the time window (${display})`);
        return;
      }
    }

    try {
      const payload = {
        name: values.title,
        location: values.location,
        minSize: values.minParticipants,
        maxSize: values.maxParticipants,
        duration: values.duration,
        timePreference: "CUSTOM",
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

      await apiService.post(`/groups/${groupId}/activities`, payload);

      messageApi.success("Activity proposed successfully!");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create activity:", error);
      messageApi.error("Failed to create activity. Please try again.");
    }
  };

  const inputStyle = {
    backgroundColor: "#f0f0f0",
    color: "#000000",
    borderColor: "#d9d9d9"
  };

  const labelStyle = {
    color: "#000000",
    fontWeight: 600,
    fontSize: "13px"
  };

  const selectTheme = {
    components: {
      Select: {
        colorBgContainer: '#f0f0f0',
        colorBorder: '#d9d9d9',
        colorText: '#000000',
        colorTextPlaceholder: '#999999',
      },
    },
  };

  return (
    <>
      {contextHolder}
      <style>{`
        .ant-form-item-explain-error,
        div[class*="explain-error"] {
          font-size: 11px !important;
          color: #ff4d4f !important;
        }
        .ant-picker-input input {
          color: #000000 !important;
        }
        .ant-picker {
          background-color: #f0f0f0 !important;
          border: 1px solid #d9d9d9 !important;
          border-radius: 6px !important;
        }
        .ant-picker-separator,
        .ant-picker-suffix {
          color: #000000 !important;
        }
        .ant-picker-input input::placeholder {
          color: #999999 !important;
        }
      `}</style>
      <Modal
        title={<span style={{ color: "black", fontSize: "22px", fontWeight: "bold" }}>New Activity</span>}
        open={visible}
        onCancel={onClose}
        onOk={() => form.submit()}
        okText="Create"
        cancelText="Cancel"
        okButtonProps={{ style: { backgroundColor: "black", color: "white", fontWeight: "bold", borderRadius: "6px" } }}
        cancelButtonProps={{ style: { color: "black", borderColor: "#d9d9d9", borderRadius: "6px" } }}
        styles={{
          body: { backgroundColor: "#ffffff", borderRadius: "12px" },
          header: { backgroundColor: "#ffffff", borderBottom: "none", paddingBottom: "10px" }
        }}
      >
        <ConfigProvider theme={selectTheme}>
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
              name="location"
              label={<span style={labelStyle}>LOCATION</span>}
              rules={[{ required: true, message: "Please enter a location" }]}
              extra={<span style={{ fontSize: "11px", color: "#999999" }}>Please enter location in English</span>}
            >
              <Input placeholder="e.g. Zermatt" style={inputStyle} />
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
                label={<span style={labelStyle}>TIME PREFERENCE</span>}
                rules={[{ required: true, message: "Please select a time window" }]}
                style={{ flex: 1 }}
              >
                <TimePicker.RangePicker format="HH:mm" style={{ width: "100%", ...inputStyle }} />
              </Form.Item>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <Form.Item
                name="minParticipants"
                label={<span style={labelStyle}>MIN PARTICIPANTS</span>}
                rules={[
                  { required: true, message: "Required" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || value <= memberCount) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(`Cannot exceed group size (${memberCount} members)`));
                    },
                  }),
                ]}
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
                      <Select placeholder="Select a preference..." style={{ width: "100%", ...inputStyle }}>
                        <Option value="Rain">Should Rain</Option>
                        <Option value="NoRain">No Rain</Option>
                        <Option value="Any">Any</Option>
                      </Select>
                    </Form.Item>
                  </div>
                ) : null
              }
            </Form.Item>
          </Form>
        </ConfigProvider>
      </Modal>
    </>
  );
};

export default CreateActivityModal;