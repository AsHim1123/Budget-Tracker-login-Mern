import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message, Table, DatePicker } from "antd";
import Layout from "./../components/Layout/Layout";
import axios from "axios";
import { UnorderedListOutlined, AreaChartOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Spinner from "../components/Spinner";
import { CalendarOutlined } from "@ant-design/icons";

import moment from "moment";
import Analytics from "../components/Analytics";
import "./HomePage.css";
import { useRef } from "react";
const { RangePicker } = DatePicker;

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allTransaction, setAllTransaction] = useState([]);
  const [frequency, setFrequency] = useState("7");
  const [selectedDate, setSelectedDate] = useState([]);
  const [type, setType] = useState("all");
  const [viewData, setViewData] = useState("table");
  const [editable, setEditable] = useState(null);
  const formRef = useRef();
  const initialFormValues = editable ? editable : {};

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (text) => (
        <span>
          <CalendarOutlined style={{ marginRight: "8px" }} />
          {moment(text).format("YYYY-MM-DD")}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (text) => <span>$ {text}</span>,
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (text) => <span>{text.charAt(0).toUpperCase() + text.slice(1)}</span>,
    },
    {
      title: "Category",
      dataIndex: "category",
      render: (text) => <span>{text.charAt(0).toUpperCase() + text.slice(1)}</span>,
    },
    {
      title: "Reference",
      dataIndex: "refrence",
    },
    {
      title: "Actions",
      render: (text, record) => (
        <div>
          <EditOutlined
            onClick={() => {
              setEditable(record);
              setShowModal(true);
            }}
            className='edit-icon'
          />
          <DeleteOutlined onClick={() => handleDelete(record)} className='delete-icon' />
        </div>
      ),
    },
  ];

  useEffect(() => {
    getAllTransactions();
  }, [frequency, selectedDate, type]);

  const getAllTransactions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      setLoading(true);
      const res = await axios.post("/api/v1/transactions/get-transaction", {
        userid: user._id,
        frequency,
        selectedDate,
        type,
      });
      setLoading(false);
      setAllTransaction(res.data);
    } catch (error) {
      message.error("Error With Transactions!");
    }
  };

  const handleDelete = async (record) => {
    try {
      setLoading(true);
      await axios.post("/api/v1/transactions/delete-transaction", { transactionId: record._id });
      setLoading(false);
      message.success("Transaction Deleted!");

      // Update the state to remove the deleted transaction
      setAllTransaction((prevTransactions) => prevTransactions.filter((transaction) => transaction._id !== record._id));
    } catch (error) {
      setLoading(false);
      console.log(error);
      message.error("Unable to Delete Transaction!");
    }
  };

  // Corrected code
  const handleSubmit = async (values) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      setLoading(true);
      if (editable) {
        // Send the updated data to the server and update it in the state
        await axios.post("/api/v1/transactions/edit-transaction", {
          payload: {
            ...values,
            userId: user._id,
          },
          transactionId: editable._id,
        });

        setLoading(false);
        message.success("Transaction Updated Successfully");
      } else {
        await axios.post("/api/v1/transactions/add-transaction", {
          ...values,
          userid: user._id,
        });
        setLoading(false);
        message.success("Transaction Added Successfully");
      }
      formRef.current.resetFields();
      getAllTransactions();
      setShowModal(false);
      setEditable(null);
    } catch (error) {
      setLoading(false);
      message.error("Failed to add transaction");
    }
  };
  useEffect(() => {
    if (editable) {
      formRef.current.setFieldsValue(editable);
    } else {
    }
  }, [editable]);

  return (
    <Layout>
      {loading && <Spinner />}
      <div className='filters'>
        <div>
          <h6>Select Frequency</h6>
          <Select value={frequency} onChange={(values) => setFrequency(values)}>
            <Select.Option value='7'>Last 1 Week</Select.Option>
            <Select.Option value='30'>Last 1 Month</Select.Option>
            <Select.Option value='365'>Last 1 Year</Select.Option>
            <Select.Option value='custom'>Custom</Select.Option>
          </Select>
          {frequency === "custom" && <RangePicker value={selectedDate} onChange={(values) => setSelectedDate(values)} />}
        </div>
        <div>
          <h6>Select Type</h6>
          <Select value={type} onChange={(values) => setType(values)}>
            <Select.Option value='all'>All</Select.Option>
            <Select.Option value='income'>Income</Select.Option>
            <Select.Option value='expense'>Expense</Select.Option>
          </Select>
          {frequency === "custom" && <RangePicker value={selectedDate} onChange={(values) => setSelectedDate(values)} />}
        </div>
        <div className='switch-icons'>
          <UnorderedListOutlined
            className={`mx-2 ${viewData === "table" ? "active-icon" : "inactive-icon"}`}
            onClick={() => setViewData("table")}
          />
          <AreaChartOutlined
            className={`mx-2 ${viewData === "analytics" ? "active-icon" : "inactive-icon"}`}
            onClick={() => setViewData("analytics")}
          />
        </div>

        <div>
          <button
            className='btn btn-primary'
            onClick={() => {
              setShowModal(true);
            }}
          >
            Add New
          </button>
        </div>
      </div>

      <div className='content'>
        {viewData === "table" ? (
          <Table
            columns={columns}
            className='table-container fade-in'
            dataSource={allTransaction.map((item, index) => ({ ...item, key: index }))}
          />
        ) : (
          <Analytics allTransaction={allTransaction} />
        )}
      </div>
      <Modal
        title={editable ? "Edit Transaction" : "Add Transaction"}
        open={showModal}
        onCancel={() => {
          setEditable(null);
          setShowModal(false);
          formRef.current.resetFields();
        }}
        footer={false}
      >
        <Form layout='vertical' onFinish={handleSubmit} initialValues={initialFormValues} ref={formRef}>
          <Form.Item label='Amount' name='amount'>
            <Input type='number' />
          </Form.Item>

          <Form.Item label='Type' name='type'>
            <Select>
              <Select.Option value='income'>Income</Select.Option>
              <Select.Option value='expense'>Expense</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label='Category' name='category'>
            <Select>
              <Select.Option value='salary'>Salary</Select.Option>
              <Select.Option value='project'>Project</Select.Option>
              <Select.Option value='food'>Food</Select.Option>
              <Select.Option value='movie'>Movie</Select.Option>
              <Select.Option value='bills'>Bills</Select.Option>
              <Select.Option value='medical'>Medical</Select.Option>
              <Select.Option value='fee'>Fee</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label='Date' name='date'>
            <Input type='date' />
          </Form.Item>
          <Form.Item label='Reference' name='refrence'>
            <Input type='text' />
          </Form.Item>
          <Form.Item label='Description' name='description'>
            <Input type='text' />
          </Form.Item>
          <div className='d-flex justify-content-end'>
            <button type='submit' className='btn btn-primary submit-button'>
              Save
            </button>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

export default HomePage;
