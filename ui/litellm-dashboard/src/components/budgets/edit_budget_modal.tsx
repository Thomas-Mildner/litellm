import React, { useEffect } from "react";
import {
  Button,
  TextInput,
  Grid,
  Col,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@tremor/react";
import {
  Button as Button2,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from "antd";
import { budgetUpdateCall } from "../networking";
import { budgetItem } from "./budget_panel";
import { getCurrencyCode } from "@/utils/currencyUtils";

interface BudgetModalProps {
  isModalVisible: boolean;
  accessToken: string | null;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setBudgetList: React.Dispatch<React.SetStateAction<any[]>>;
  existingBudget: budgetItem
  handleUpdateCall: () => void
}
const EditBudgetModal: React.FC<BudgetModalProps> = ({
  isModalVisible,
  accessToken,
  setIsModalVisible,
  setBudgetList,
  existingBudget,
  handleUpdateCall
}) => {
  console.log("existingBudget", existingBudget)
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(existingBudget);
  }, [existingBudget, form]);

  const handleOk = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCreate = async (formValues: Record<string, any>) => {
    if (accessToken == null || accessToken == undefined) {
      return;
    }
    try {
      message.info("Making API Call");
      setIsModalVisible(true);
      const response = await budgetUpdateCall(accessToken, formValues);
      setBudgetList((prevData) =>
        prevData ? [...prevData, response] : [response]
      ); // Check if prevData is null
      message.success("Budget Updated");
      form.resetFields();
      handleUpdateCall();
    } catch (error) {
      console.error("Error creating the key:", error);
      message.error(`Error creating the key: ${error}`, 20);
    }
  };

  return (
    <Modal
      title="Edit Budget"
      visible={isModalVisible}
      width={800}
      footer={null}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        onFinish={handleCreate}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        labelAlign="left"
        initialValues={existingBudget}
      >
        <>
          <Form.Item
            label="Budget ID"
            name="budget_id"
            rules={[
              {
                required: true,
                message: "Please input a human-friendly name for the budget",
              },
            ]}
            help="A human-friendly name for the budget"
          >
            <TextInput placeholder="" />
          </Form.Item>
          <Form.Item
            label="Max Tokens per minute"
            name="tpm_limit"
            help="Default is model limit."
          >
            <InputNumber step={1} precision={2} width={200} />
          </Form.Item>
          <Form.Item
            label="Max Requests per minute"
            name="rpm_limit"
            help="Default is model limit."
          >
            <InputNumber step={1} precision={2} width={200} />
          </Form.Item>

          <Accordion className="mt-20 mb-8">
            <AccordionHeader>
              <b>Optional Settings</b>
            </AccordionHeader>
            <AccordionBody>
              <Form.Item
                label={`Max Budget (${getCurrencyCode()})`}
                name="max_budget"
              >
                <InputNumber step={0.01} precision={2} width={200} />
              </Form.Item>
              <Form.Item
                className="mt-8"
                label="Reset Budget"
                name="budget_duration"
              >
                <Select defaultValue={null} placeholder="n/a">
                  <Select.Option value="24h">daily</Select.Option>
                  <Select.Option value="7d">weekly</Select.Option>
                  <Select.Option value="30d">monthly</Select.Option>
                </Select>
              </Form.Item>
            </AccordionBody>
          </Accordion>
        </>

        <div style={{ textAlign: "right", marginTop: "10px" }}>
          <Button2 htmlType="submit">Save</Button2>
        </div>
      </Form>
    </Modal>
  );
};

export default EditBudgetModal;
