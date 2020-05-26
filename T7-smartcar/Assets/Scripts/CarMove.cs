using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CarMove : MonoBehaviour
{
    [Tooltip("Velocidad. El movimiento es uniforme")]
    public float speed = 15f;
    [Tooltip("Capacidad de doblar")]
    public float torque = 8f;
    [Tooltip("Para llevar seguimiento de la velocidad actual")]
    public float currentVertical = 0;
    [Tooltip("Falso para usar flechas para controlar el carro")]
    public bool autoDrive = true;
    [Tooltip("Magnitud de vectores para detectar obstaculos")]
    public float sight = 7f;

    private void Update()
    {
        float vertical, horizontal;
        if (autoDrive)
        {
            float fr = CastRay(1.5f, .5f, 25f);
            float f = CastRay(1.5f, 0f, 0f);
            float fl = CastRay(1.5f, -.5f, -25f);

            if( fr == -1f)
            {
                fr = 0;
            }
            if( fl == -1f)
            {
                fl = 0;
            }
            if( f == -1f)
            {
                f = 1;
            }

            horizontal = fl - fr;
            vertical = f;
        } else {
            horizontal = Input.GetAxis("Horizontal");
            vertical = Input.GetAxis("Vertical");
        }
        float dt = Time.deltaTime;
        MoveCar(horizontal, vertical, dt);
    }

    private void MoveCar(float horizontal, float vertical, float dt)
    {
        currentVertical = vertical;
        float moveDist = speed * vertical;
        transform.Translate(dt * moveDist * Vector3.forward);
        float rotation = horizontal * torque * 90f;
        transform.Rotate(0f, rotation * dt, 0f);
    }
    private float CastRay(float zOffset, float xOffset, float angle)
    {
        Transform tf = transform;
        Vector3 raySource = tf.position + Vector3.up / 2f;
        Vector3 position = raySource + tf.forward * zOffset + tf.right * xOffset;
        Quaternion eulerAngle = Quaternion.Euler(0, angle, 0f);
        Vector3 dir = eulerAngle * tf.forward;
        bool didHit = Physics.Raycast(position, dir, out var hit, sight);
        return didHit ? hit.distance / sight : -1f;
    }
}
